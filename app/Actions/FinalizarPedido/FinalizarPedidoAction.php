<?php

namespace App\Actions\FinalizarPedido;

use App\Models\CategoriaBorda;
use App\Models\CategoriaMassa;
use App\Models\Cliente;
use App\Models\Complemento;
use App\Models\FinanceiroPedido;
use App\Models\FormaPagamento;
use App\Models\Integracao;
use App\Models\Item;
use App\Models\Mesa;
use App\Models\Notificacao;
use App\Models\Pedido;
use App\Models\PedidoComboItem;
use App\Models\PedidoComplemento;
use App\Models\PedidoItem;
use App\Models\PedidoSaborPizza;
use App\Models\StatusFinanceiroPedidoApi;
use App\Services\Fidelidade\FidelidadeService;
use App\Services\Pagarme\Pedidos\ApiExternaPedidos;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class FinalizarPedidoAction
{
    public function handle(
        array $pedido,
        ?string $forma_pagamento,
        ?float $trocoPara,
        ?float $frete,
        float $subtotal,
        float $total,
        ?string $observacao,
        ?array $cliente,
        string $tipo_funcionamento,
        int $empresa_id,
        array $configuracoes,
        ?int $mesa,
        ?string $comanda,
        ?string $cupom = null,
        bool $usarCashback = false,
        ?array $resgateFidelidade = null,
    ): array {
        return DB::transaction(function () use (
            $pedido,
            $forma_pagamento,
            $trocoPara,
            $frete,
            $subtotal,
            $total,
            $observacao,
            $cliente,
            $tipo_funcionamento,
            $empresa_id,
            $configuracoes,
            $mesa,
            $comanda,
            $cupom,
            $usarCashback,
            $resgateFidelidade,
        ) {
            $cupomValidado = null;
            $valorDesconto = 0.0;

            if ($cupom && $tipo_funcionamento !== 'mesa') {
                $cupomValidado = (new ValidaCupomPedidoAction())->handle($cupom, $empresa_id, $subtotal, $frete);
                $valorDesconto = $cupomValidado->valor_desconto_calculado;
            }

            $clienteAutenticado = Auth::check() ? Auth::user()->cliente : null;

            $cashbackUtilizado = 0.0;

            if ($usarCashback && $clienteAutenticado && $tipo_funcionamento !== 'mesa') {
                $saldoCashback = (new CalculaSaldoCashbackAction())->handle($clienteAutenticado->id);
                $totalAntesCashback = max(0, $subtotal + floatval($frete ?? 0) - $valorDesconto);
                $cashbackUtilizado = round(min($saldoCashback, $totalAntesCashback), 2);
            }

            $valorMinimo = floatval($configuracoes['valor_minimo_pedido'] ?? 0);
            if ($valorMinimo > 0 && $subtotal < $valorMinimo) {
                throw new Exception('O valor mínimo para pedidos é de R$ ' . number_format($valorMinimo, 2, ',', '.'));
            }

            foreach ($pedido as $item) {
                if (floatval($item['total'] ?? 0) <= 0) {
                    throw new Exception(
                        'O item "' . ($item['nome'] ?? 'desconhecido') .
                        '" está com valor zerado e não pode ser incluído no pedido. Remova-o e tente novamente.'
                    );
                }
            }

            if ($tipo_funcionamento === 'mesa') {
                if (empty($mesa)) {
                    throw new Exception('Deve ser informado uma mesa.');
                }

                $mesaCadastrada = Mesa::query()->where('empresa_id', $empresa_id)->where('mesa', $mesa)->exists();
                if (! $mesaCadastrada) {
                    throw new Exception('Mesa não cadastrada.');
                }
            }

            if ($tipo_funcionamento === 'mesa' && boolval($configuracoes['informa_mesa_comanda'] ?? false) && empty($comanda)) {
                throw new Exception('Deve ser informado uma comanda.');
            }

            if ($tipo_funcionamento === 'delivery' && (!Auth::check() || !$cliente || empty($cliente['endereco']))) {
                throw new Exception('É necessário cadastrar um endereço para pedidos delivery.');
            }

            $ehModoAtendente = $tipo_funcionamento === 'mesa' && boolval($configuracoes['modo_atendente'] ?? false);

            $dadosPedido = [
                'empresa_id'          => $empresa_id,
                'cliente_id'          => $ehModoAtendente ? null : ($cliente['id'] ?? null),
                'tipo'                => $this->defineTipoParaPedido($tipo_funcionamento),
                'observacao'          => $observacao,
                'valor_frete'         => $tipo_funcionamento === 'delivery' ? $frete : null,
                'endereco_entrega_id' => ($tipo_funcionamento === 'delivery' && Auth::check())
                    ? ($cliente['endereco']['id'] ?? null)
                    : null,
                'nome'     => $ehModoAtendente ? session('nome_cliente_modoatendente') : ($cliente['nome'] ?? null),
                'telefone' => $ehModoAtendente ? session('telefone_cliente_modoatendente') : ($cliente['telefone'] ?? null),
            ];

            if ($tipo_funcionamento === 'mesa') {
                $dadosPedido['mesa']                  = $mesa;
                $dadosPedido['informa_comanda_manual'] = boolval($configuracoes['informa_mesa_comanda'] ?? false);
                $dadosPedido['comanda']               = $dadosPedido['informa_comanda_manual']
                    ? $comanda
                    : session('comanda_atual');
            }

            $totalFinanceiro = $tipo_funcionamento !== 'mesa'
                ? ($subtotal + floatval($frete ?? 0) - $valorDesconto - $cashbackUtilizado)
                : $subtotal;

            // Item grátis de fidelidade já é escolhido pelo cliente antes de finalizar (ModalEscolherPremio),
            // então o pedido nunca precisa esperar seleção pós-criação — não existe estado "aguardando_item_premio" aqui.
            $formaPagamentoTipo = ($tipo_funcionamento !== 'mesa' && $forma_pagamento)
                ? FormaPagamento::find($forma_pagamento)?->tipo
                : null;

            $temIntegracaoPagarme = Integracao::where('empresa_id', $empresa_id)
                ->where('tipo', 'pagarme')
                ->whereNotNull('chavesecreta_pagarme')
                ->exists();

            $pixComPagarme = $tipo_funcionamento === 'delivery'
                && ! $usarCashback
                && $formaPagamentoTipo === 'PIX'
                && $temIntegracaoPagarme
                && $totalFinanceiro > 0;

            $dadosPedido['status'] = match (true) {
                $tipo_funcionamento === 'mesa' => 'pedido feito',
                $pixComPagarme => 'confirmar pix',
                default => 'pendente',
            };

            $pedidoCadastrado = Pedido::create($dadosPedido);

            $pagaEmDinheiro = $formaPagamentoTipo === 'DIN';

            $financeiro = [
                'uuid'               => uuid_create(),
                'pedido_id'          => $pedidoCadastrado->id,
                'forma_pagamento_id' => $tipo_funcionamento !== 'mesa' ? $forma_pagamento : null,
                'subtotal_itens'     => $subtotal,
                'total'              => $totalFinanceiro,
                'valor_desconto'     => $valorDesconto > 0 ? $valorDesconto : null,
                'cashback_utilizado' => $cashbackUtilizado,
                'troco_para'         => $pagaEmDinheiro ? $trocoPara : null,
                'valor_troco'        => $pagaEmDinheiro && $trocoPara !== null ? round($trocoPara - $totalFinanceiro, 2) : null,
            ];

            // TODO: Múltiplas formas de pagamento (FinanceiroPedidoPagamento) — implementar quando a tela estiver pronta

            $financeiroCriado = FinanceiroPedido::create($financeiro);

            if ($cupomValidado && $clienteAutenticado) {
                DB::table('promocao_usada')->insert([
                    'promocao_id' => $cupomValidado->id,
                    'cliente_id'  => $clienteAutenticado->id,
                    'pedido_id'   => $pedidoCadastrado->id,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            }

            if ($cashbackUtilizado > 0 && $clienteAutenticado) {
                (new ConsomeCashbackAction())->handle($clienteAutenticado->id, $cashbackUtilizado);
            }

            foreach ($pedido as $item) {
                match ($item['tipo']) {
                    'PRE', 'BEB', 'IND' => $this->salvaItemRegular($pedidoCadastrado->id, $item),
                    'PIZ'               => $this->salvaItemPizza($pedidoCadastrado->id, $item),
                    'CON'               => $this->salvaItemCombo($pedidoCadastrado->id, $item),
                    default             => throw new Exception('Tipo de item inválido: ' . $item['tipo']),
                };
            }

            $cashbackGerado = 0.0;

            if ($clienteAutenticado) {
                $cashbackGerado = (new GeraCreditoCashbackAction())->handle(
                    $empresa_id,
                    $clienteAutenticado->id,
                    $pedidoCadastrado,
                    $tipo_funcionamento,
                    $subtotal,
                    $cashbackUtilizado,
                );
            }

            if ($clienteAutenticado && ($resgateFidelidade['usar'] ?? false)) {
                app(FidelidadeService::class)->aplicarRecompensa(
                    $pedidoCadastrado,
                    $resgateFidelidade['item_id'] ?? null,
                    $resgateFidelidade['tipo'] ?? 'I',
                    $resgateFidelidade['complementos'] ?? [],
                    $resgateFidelidade['pizza_config'] ?? null,
                    $resgateFidelidade['combo_config'] ?? null,
                );
            }

            if ($pixComPagarme && $clienteAutenticado) {
                $this->geraPedidoPagarme($pedidoCadastrado, $financeiroCriado, $clienteAutenticado, floatval($frete ?? 0));
            }

            // Pedido "confirmar pix" ainda não é um pedido ativo (nem aparece no Kanban) —
            // a notificação dele só faz sentido quando o pagamento é confirmado pelo webhook.
            if (! $pixComPagarme) {
                Notificacao::create([
                    'empresa_id' => $empresa_id,
                    'tipo' => 'novo_pedido',
                    'titulo' => 'Novo pedido recebido',
                    'mensagem' => sprintf(
                        'Pedido #%d — %s — R$ %s',
                        $pedidoCadastrado->id,
                        $dadosPedido['nome'] ?? 'Cliente',
                        number_format($totalFinanceiro, 2, ',', '.'),
                    ),
                    'data' => ['pedido_id' => $pedidoCadastrado->id],
                ]);
            }

            return [
                'pedido' => $pedidoCadastrado,
                'cashback_gerado' => $cashbackGerado,
            ];
        });
    }

    private function salvaItemRegular(int $pedidoId, array $item): void
    {
        $itemBD = Item::find($item['id']);
        $precoUnitario = $itemBD
            ? ($itemBD->desconto ? floatval($itemBD->valor_desconto) : floatval($itemBD->preco))
            : floatval($item['preco_unitario'] ?? 0);

        $totalComplementos = array_sum(array_map(
            fn ($grupo) => array_sum(array_map(
                fn ($c) => $c['quantidade'] * floatval($c['preco']),
                array_filter($grupo['complementos'] ?? [], fn ($c) => ($c['quantidade'] ?? 0) > 0)
            )),
            $item['grupo_complemento'] ?? []
        ));

        $pedidoItem = PedidoItem::create([
            'pedido_id'      => $pedidoId,
            'item_id'        => $item['id'],
            'uuid'           => uuid_create(),
            'nome'           => $item['nome'],
            'quantidade'     => $item['quantidade'],
            'preco_unitario' => $precoUnitario,
            'subtotal'       => $item['quantidade'] * $precoUnitario + $totalComplementos,
            'tipo'           => 'I',
            'observacao'     => $item['observacao'] ?? null,
        ]);

        foreach ($item['grupo_complemento'] ?? [] as $grupo) {
            foreach (array_filter($grupo['complementos'] ?? [], fn ($c) => ($c['quantidade'] ?? 0) > 0) as $complemento) {
                $complementoBD = Complemento::find($complemento['id']);
                PedidoComplemento::create([
                    'pedido_item_id' => $pedidoItem->id,
                    'complemento_id' => $complemento['id'],
                    'uuid'           => uuid_create(),
                    'nome'           => $complementoBD?->nome ?? $complemento['nome'],
                    'qtde'           => $complemento['quantidade'],
                    'preco_unitario' => $complementoBD ? floatval($complementoBD->preco) : floatval($complemento['preco']),
                ]);
            }
        }
    }

    private function salvaItemPizza(int $pedidoId, array $item): void
    {
        $pedidoItem = PedidoItem::create([
            'pedido_id'      => $pedidoId,
            'item_id'        => null,
            'borda_id'       => $item['bordaSelecionada']['id'] ?? null,
            'massa_id'       => $item['massaSelecionada']['id'] ?? null,
            'preco_borda'    => isset($item['bordaSelecionada']['id'])
                ? (CategoriaBorda::find($item['bordaSelecionada']['id'])?->preco ?? 0)
                : 0,
            'preco_massa'    => isset($item['massaSelecionada']['id'])
                ? (CategoriaMassa::find($item['massaSelecionada']['id'])?->preco ?? 0)
                : 0,
            'tamanho_id'     => $item['id'],
            'uuid'           => uuid_create(),
            'nome'           => $item['nome'] ?? 'Pizza',
            'quantidade'     => $item['quantidade'],
            'preco_unitario' => 0,
            'tipo'           => 'P',
            'observacao'     => $item['observacao'] ?? null,
        ]);

        $saboresSelecionados = array_values(
            array_filter($item['sabores'] ?? [], fn ($s) => ($s['quantidade'] ?? 0) > 0)
        );
        $qtdeSabores = count($saboresSelecionados);

        foreach ($saboresSelecionados as $sabor) {
            PedidoSaborPizza::create([
                'pedido_item_id' => $pedidoItem->id,
                'sabor_id'       => $sabor['item_id'] ?? $sabor['id'],
                'uuid'           => uuid_create(),
                'nome'           => $sabor['nome'],
                'descricao'      => $sabor['descricao'] ?? null,
                'preco_unitario' => floatval($sabor['preco']),
                'qtde'           => $sabor['quantidade'],
                'qtde_fracionada' => $qtdeSabores > 0
                    ? round($sabor['quantidade'] / $qtdeSabores, 4)
                    : 1,
            ]);
        }
    }

    private function salvaItemCombo(int $pedidoId, array $item): void
    {
        $pedidoItem = PedidoItem::create([
            'pedido_id'      => $pedidoId,
            'item_id'        => $item['id'],
            'uuid'           => uuid_create(),
            'nome'           => $item['nome'],
            'quantidade'     => $item['quantidade'],
            'preco_unitario' => floatval($item['preco_fixo'] ?? $item['preco_unitario'] ?? 0),
            'subtotal'       => $item['quantidade'] * floatval($item['preco_unitario'] ?? 0),
            'tipo'           => 'C',
            'tipo_preco'     => $item['tipo_preco'] ?? 'preco_combo',
            'observacao'     => $item['observacao'] ?? null,
        ]);

        foreach ($item['grupos'] ?? [] as $grupo) {
            foreach (array_filter($grupo['itens'] ?? [], fn ($i) => ($i['quantidade'] ?? 0) > 0) as $itemCombo) {
                PedidoComboItem::create([
                    'pedido_item_id' => $pedidoItem->id,
                    'uuid'           => uuid_create(),
                    'referencia_id'  => $itemCombo['referencia_id'],
                    'tipo'           => 'item',
                    'grupo_nome'     => $grupo['nome'],
                    'item_nome'      => $itemCombo['nome'],
                    'preco_unitario' => floatval($itemCombo['preco']),
                    'qtde'           => $itemCombo['quantidade'],
                ]);
            }
        }

        foreach ($item['grupos_complemento'] ?? [] as $gc) {
            foreach (array_filter($gc['complementos'] ?? [], fn ($c) => ($c['quantidade'] ?? 0) > 0) as $complemento) {
                PedidoComboItem::create([
                    'pedido_item_id' => $pedidoItem->id,
                    'uuid'           => uuid_create(),
                    'referencia_id'  => $complemento['referencia_id'],
                    'tipo'           => 'complemento',
                    'grupo_nome'     => $gc['nome'],
                    'item_nome'      => $complemento['nome'],
                    'preco_unitario' => floatval($complemento['preco']),
                    'qtde'           => $complemento['quantidade'],
                ]);
            }
        }
    }

    private function defineTipoParaPedido(string $tipo_funcionamento): string
    {
        return match ($tipo_funcionamento) {
            'delivery' => 'D',
            'mesa'     => 'M',
            'retirada' => 'R',
        };
    }

    /**
     * Gera o pedido/cobrança PIX na Pagar.me. Falhas de comunicação com a API externa não devem
     * derrubar o pedido já criado: o cliente cai de volta para "pendente" e segue manualmente.
     */
    private function geraPedidoPagarme(Pedido $pedido, FinanceiroPedido $financeiro, Cliente $cliente, float $frete): void
    {
        $endereco = $cliente->endereco;

        if (! $endereco) {
            Log::channel('financial')->warning('[PAGARME] Cliente sem endereço cadastrado, pix não gerado', [
                'pedido_id' => $pedido->id,
                'cliente_id' => $cliente->id,
            ]);

            return;
        }

        try {
            $financeiro->refresh();
            $pedido->load('itens.sabores');

            $telefoneDigitos = preg_replace('/\D/', '', $cliente->telefone ?? '');
            $enderecoArray = [
                'line_1'   => substr("{$endereco->numero}, {$endereco->logradouro}, {$endereco->bairro}", 0, 255),
                'line_2'   => substr($endereco->complemento ?? '', 0, 255),
                'zip_code' => preg_replace('/\D/', '', $endereco->cep ?? ''),
                'city'     => $endereco->cidade,
                'state'    => $endereco->uf,
                'country'  => 'BR',
            ];

            app(ApiExternaPedidos::class)->criarPedido(
                empresa_id: $pedido->empresa_id,
                uuid_financeiro: $financeiro->uuid,
                cliente: [
                    'name' => $cliente->nome,
                    'type' => 'individual',
                    'email' => $cliente->email,
                    'document' => preg_replace('/\D/', '', $cliente->cpf_cnpj ?? ''),
                    'address' => $enderecoArray,
                    'phones' => [
                        'mobile_phone' => [
                            'country_code' => '55',
                            'area_code' => substr($telefoneDigitos, 0, 2),
                            'number' => substr($telefoneDigitos, 2),
                        ],
                    ],
                ],
                items: $this->montaItensPagarme($pedido),
                pagamento: [[
                    'payment_method' => 'pix',
                    'pix' => ['expires_in' => StatusFinanceiroPedidoApi::EXPIRACAO_MINUTOS * 60],
                    'amount' => $this->realCentavo($financeiro->total),
                ]],
                entrega: [
                    'amount' => $this->realCentavo($frete),
                    'description' => 'Frete',
                    'recipient_name' => $cliente->nome,
                    'recipient_phone' => $telefoneDigitos,
                    'address' => $enderecoArray,
                ],
            );
        } catch (Throwable $e) {
            Log::channel('financial')->error('[PAGARME] Falha ao gerar pedido PIX, pedido segue como pendente', [
                'pedido_id' => $pedido->id,
                'erro' => $e->getMessage(),
            ]);

            $pedido->update(['status' => 'pendente']);
        }
    }

    /**
     * @return array<int, array{amount: int, code: string, description: string, quantity: int}>
     */
    private function montaItensPagarme(Pedido $pedido): array
    {
        return $pedido->itens->map(function (PedidoItem $item) {
            // Item premiado (fidelidade) é grátis para o cliente — o desconto já está
            // refletido no total do pedido, então ele entra no recibo com valor zero.
            $valor = $item->item_premio ? 0.0 : match ($item->tipo) {
                'I', 'C' => (float) $item->subtotal,
                'P'      => $item->sabores->sum(fn ($s) => $s->preco_unitario * $s->qtde)
                    + (float) $item->preco_borda + (float) $item->preco_massa,
                default  => 0.0,
            };

            return [
                'amount'      => $this->realCentavo($valor),
                'code'        => (string) $item->id,
                'description' => $item->nome,
                'quantity'    => $item->quantidade,
            ];
        })->all();
    }

    private function realCentavo(float $valor): int
    {
        return (int) round($valor * 100);
    }
}
