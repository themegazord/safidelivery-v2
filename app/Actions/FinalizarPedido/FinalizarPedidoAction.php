<?php

namespace App\Actions\FinalizarPedido;

use App\Models\CategoriaBorda;
use App\Models\CategoriaMassa;
use App\Models\CategoriaTamanho;
use App\Models\Cliente;
use App\Models\Combo;
use App\Models\ComboEntrada;
use App\Models\Complemento;
use App\Models\FinanceiroPedido;
use App\Models\FinanceiroPedidoPagamento;
use App\Models\FormaPagamento;
use App\Models\Integracao;
use App\Models\Item;
use App\Models\ItemPreco;
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
        ?array $pagamentos = null,
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
            $pagamentos,
        ) {
            // Uma única entrada em "pagamentos" equivale ao fluxo de forma de pagamento
            // única — normaliza aqui para não precisar duplicar a lógica abaixo.
            if ($pagamentos && count($pagamentos) === 1) {
                $forma_pagamento = (string) $pagamentos[0]['forma_pagamento_id'];
                $trocoPara = ! empty($pagamentos[0]['troco_para']) ? floatval($pagamentos[0]['troco_para']) : null;
                $pagamentos = null;
            }

            $usaMultiplasFormas = $tipo_funcionamento !== 'mesa' && $pagamentos && count($pagamentos) > 1;

            if ($usaMultiplasFormas) {
                $idsInformados = array_column($pagamentos, 'forma_pagamento_id');
                $idsValidos = FormaPagamento::where('empresa_id', $empresa_id)
                    ->whereIn('id', $idsInformados)
                    ->pluck('id')
                    ->all();

                if (count(array_diff($idsInformados, $idsValidos)) > 0) {
                    throw new Exception('Uma das formas de pagamento selecionadas é inválida.');
                }
            }

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

            // cliente_id, endereco_entrega_id, nome e telefone vêm do cliente autenticado
            // (nunca do array $cliente enviado no corpo da requisição) — do contrário, um
            // pedido poderia ser forjado em nome de outro cliente_id ou com o endereço de
            // entrega de outra pessoa, bastando alterar o payload da requisição.
            $dadosPedido = [
                'empresa_id'          => $empresa_id,
                'cliente_id'          => $ehModoAtendente ? null : $clienteAutenticado?->id,
                'tipo'                => $this->defineTipoParaPedido($tipo_funcionamento),
                'observacao'          => $observacao,
                'valor_frete'         => $tipo_funcionamento === 'delivery' ? $frete : null,
                'endereco_entrega_id' => ($tipo_funcionamento === 'delivery' && $clienteAutenticado)
                    ? $clienteAutenticado->enderecos()->where('enderecos.id', $cliente['endereco']['id'] ?? null)->value('enderecos.id')
                    : null,
                'nome'     => $ehModoAtendente ? session('nome_cliente_modoatendente') : ($clienteAutenticado->nome ?? null),
                'telefone' => $ehModoAtendente ? session('telefone_cliente_modoatendente') : ($clienteAutenticado->telefone ?? null),
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

            if ($usaMultiplasFormas) {
                $somaPagamentos = round(array_sum(array_map(fn ($p) => floatval($p['valor'] ?? 0), $pagamentos)), 2);
                if (abs($somaPagamentos - round($totalFinanceiro, 2)) > 0.01) {
                    throw new Exception('A soma dos valores informados nas formas de pagamento deve ser igual ao total do pedido.');
                }
            }

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

            $pagaEmDinheiro = ! $usaMultiplasFormas && $formaPagamentoTipo === 'DIN';

            $financeiro = [
                'uuid'               => uuid_create(),
                'pedido_id'          => $pedidoCadastrado->id,
                'forma_pagamento'    => $usaMultiplasFormas ? 'multiplo' : null,
                'forma_pagamento_id' => ($tipo_funcionamento !== 'mesa' && ! $usaMultiplasFormas) ? $forma_pagamento : null,
                'subtotal_itens'     => $subtotal,
                'total'              => $totalFinanceiro,
                'valor_desconto'     => $valorDesconto > 0 ? $valorDesconto : null,
                'cashback_utilizado' => $cashbackUtilizado,
                'troco_para'         => $pagaEmDinheiro ? $trocoPara : null,
                'valor_troco'        => $pagaEmDinheiro && $trocoPara !== null ? round($trocoPara - $totalFinanceiro, 2) : null,
            ];

            $financeiroCriado = FinanceiroPedido::create($financeiro);

            if ($usaMultiplasFormas) {
                foreach ($pagamentos as $pagamento) {
                    $valorPagamento = round(floatval($pagamento['valor']), 2);
                    $trocoParaPagamento = ! empty($pagamento['troco_para']) ? floatval($pagamento['troco_para']) : null;

                    FinanceiroPedidoPagamento::create([
                        'financeiro_pedido_uuid' => $financeiroCriado->uuid,
                        'forma_pagamento_id'     => $pagamento['forma_pagamento_id'],
                        'valor'                  => $valorPagamento,
                        'troco_para'             => $trocoParaPagamento,
                        'valor_troco'            => $trocoParaPagamento !== null ? round($trocoParaPagamento - $valorPagamento, 2) : null,
                    ]);
                }
            }

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

            $subtotalRecalculado = 0.0;

            foreach ($pedido as $item) {
                $subtotalRecalculado += match ($item['tipo']) {
                    'PRE', 'BEB', 'IND' => $this->salvaItemRegular($pedidoCadastrado->id, $empresa_id, $item),
                    'PIZ'               => $this->salvaItemPizza($pedidoCadastrado->id, $empresa_id, $item),
                    'CON'               => $this->salvaItemCombo($pedidoCadastrado->id, $empresa_id, $item),
                    default             => throw new Exception('Tipo de item inválido: ' . $item['tipo']),
                };
            }

            // Os preços de cada item são sempre recalculados a partir do banco (acima) — aqui
            // conferimos que o subtotal que o cliente enviou bate com o que foi de fato salvo.
            // Sem essa checagem, o subtotal/total do pedido (usado inclusive para gerar a
            // cobrança Pix via Pagar.me) continuaria vindo direto do payload da requisição.
            if (abs($subtotalRecalculado - $subtotal) > 0.01) {
                throw new Exception('O valor dos itens não confere com o valor calculado pelo servidor. Atualize a página e tente novamente.');
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

    // Os três métodos abaixo NUNCA confiam em preço vindo do payload — cada preço é
    // relido do banco pelo id enviado. O valor do payload só é usado como último recurso,
    // se o registro correspondente já não existir mais (ex.: item excluído do cardápio),
    // caso em que a divergência resultante é pega pela checagem de subtotal em handle().

    private function salvaItemRegular(int $pedidoId, int $empresaId, array $item): float
    {
        $itemBD = Item::where('id', $item['id'])
            ->whereHas('categoria.cardapio', fn ($q) => $q->where('empresa_id', $empresaId))
            ->first();

        if (! $itemBD) {
            throw new Exception('O item "' . ($item['nome'] ?? 'desconhecido') . '" não está disponível nesta loja. Atualize a página e tente novamente.');
        }

        $precoUnitario = $itemBD->desconto ? floatval($itemBD->valor_desconto) : floatval($itemBD->preco);

        $gruposComplemento = $item['grupo_complemento'] ?? [];
        $idsComplementos = collect($gruposComplemento)
            ->flatMap(fn ($g) => $g['complementos'] ?? [])
            ->pluck('id')
            ->filter()
            ->unique()
            ->values();
        $complementosBD = Complemento::whereIn('id', $idsComplementos)
            ->whereHas('grupos.item.categoria.cardapio', fn ($q) => $q->where('empresa_id', $empresaId))
            ->get()
            ->keyBy('id');

        $totalComplementos = 0.0;

        foreach ($gruposComplemento as $grupo) {
            foreach (array_filter($grupo['complementos'] ?? [], fn ($c) => ($c['quantidade'] ?? 0) > 0) as $complemento) {
                $complementoBD = $complementosBD->get($complemento['id']);
                if (! $complementoBD) {
                    throw new Exception('Um dos complementos selecionados não está disponível nesta loja. Atualize a página e tente novamente.');
                }
                $totalComplementos += $complemento['quantidade'] * floatval($complementoBD->preco);
            }
        }

        $pedidoItem = PedidoItem::create([
            'pedido_id'      => $pedidoId,
            'item_id'        => $itemBD->id,
            'uuid'           => uuid_create(),
            'nome'           => $itemBD->nome,
            'quantidade'     => $item['quantidade'],
            'preco_unitario' => $precoUnitario,
            'subtotal'       => $item['quantidade'] * $precoUnitario + $totalComplementos,
            'tipo'           => 'I',
            'observacao'     => $item['observacao'] ?? null,
        ]);

        foreach ($gruposComplemento as $grupo) {
            foreach (array_filter($grupo['complementos'] ?? [], fn ($c) => ($c['quantidade'] ?? 0) > 0) as $complemento) {
                $complementoBD = $complementosBD->get($complemento['id']);
                PedidoComplemento::create([
                    'pedido_item_id' => $pedidoItem->id,
                    'complemento_id' => $complementoBD->id,
                    'uuid'           => uuid_create(),
                    'nome'           => $complementoBD->nome,
                    'qtde'           => $complemento['quantidade'],
                    'preco_unitario' => floatval($complementoBD->preco),
                ]);
            }
        }

        return $item['quantidade'] * $precoUnitario + $totalComplementos;
    }

    private function salvaItemPizza(int $pedidoId, int $empresaId, array $item): float
    {
        $tamanhoBD = CategoriaTamanho::where('id', $item['id'])
            ->whereHas('categoria.cardapio', fn ($q) => $q->where('empresa_id', $empresaId))
            ->first();

        if (! $tamanhoBD) {
            throw new Exception('O tamanho de pizza selecionado não está disponível nesta loja. Atualize a página e tente novamente.');
        }

        // Borda e massa são opcionais: se o id não pertencer a esta empresa, tratamos como "não
        // selecionado" (preço 0) em vez de confiar no preço enviado pelo cliente.
        $precoBorda = 0.0;
        if (isset($item['bordaSelecionada']['id'])) {
            $bordaBD = CategoriaBorda::where('id', $item['bordaSelecionada']['id'])
                ->whereHas('categoria.cardapio', fn ($q) => $q->where('empresa_id', $empresaId))
                ->first();
            $precoBorda = (float) ($bordaBD?->preco ?? 0);
        }

        $precoMassa = 0.0;
        if (isset($item['massaSelecionada']['id'])) {
            $massaBD = CategoriaMassa::where('id', $item['massaSelecionada']['id'])
                ->whereHas('categoria.cardapio', fn ($q) => $q->where('empresa_id', $empresaId))
                ->first();
            $precoMassa = (float) ($massaBD?->preco ?? 0);
        }

        $pedidoItem = PedidoItem::create([
            'pedido_id'      => $pedidoId,
            'item_id'        => null,
            'borda_id'       => $item['bordaSelecionada']['id'] ?? null,
            'massa_id'       => $item['massaSelecionada']['id'] ?? null,
            'preco_borda'    => $precoBorda,
            'preco_massa'    => $precoMassa,
            'tamanho_id'     => $tamanhoBD->id,
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

        $itensPrecoBD = ItemPreco::whereIn('id', array_column($saboresSelecionados, 'id'))
            ->where('tamanho_id', $tamanhoBD->id)
            ->get()
            ->keyBy('id');

        $totalSabores = 0.0;

        foreach ($saboresSelecionados as $sabor) {
            $itemPrecoBD = $itensPrecoBD->get($sabor['id']);
            if (! $itemPrecoBD) {
                throw new Exception('Um dos sabores selecionados não está disponível nesta loja. Atualize a página e tente novamente.');
            }
            $precoUnitario = $qtdeSabores > 0
                ? round(floatval($itemPrecoBD->preco) / $qtdeSabores, 2)
                : floatval($itemPrecoBD->preco);

            PedidoSaborPizza::create([
                'pedido_item_id' => $pedidoItem->id,
                'sabor_id'       => $sabor['item_id'] ?? $sabor['id'],
                'uuid'           => uuid_create(),
                'nome'           => $sabor['nome'],
                'descricao'      => $sabor['descricao'] ?? null,
                'preco_unitario' => $precoUnitario,
                'qtde'           => $sabor['quantidade'],
                'qtde_fracionada' => $qtdeSabores > 0
                    ? round($sabor['quantidade'] / $qtdeSabores, 4)
                    : 1,
            ]);

            $totalSabores += $sabor['quantidade'] * $precoUnitario;
        }

        return $item['quantidade'] * ($totalSabores + $precoMassa + $precoBorda);
    }

    private function salvaItemCombo(int $pedidoId, int $empresaId, array $item): float
    {
        $combo = Combo::with('meta')
            ->where('id', $item['id'])
            ->whereHas('categoria.cardapio', fn ($q) => $q->where('empresa_id', $empresaId))
            ->first();

        if (! $combo) {
            throw new Exception('O combo selecionado não está disponível nesta loja. Atualize a página e tente novamente.');
        }

        $tipoPreco = $combo->tipo_preco;

        $entradasPorTipo = ComboEntrada::where('combo_id', $combo->id)->get()->groupBy('tipo');
        $entradasItem = ($entradasPorTipo->get('item') ?? collect())->keyBy('referencia_id');
        $entradasComplemento = ($entradasPorTipo->get('complemento') ?? collect())->keyBy('referencia_id');

        $precoBase = $tipoPreco === 'preco_combo'
            ? (float) ($combo->meta?->preco_combo ?? $combo->preco ?? 0)
            : 0.0;

        $itensCombo = [];
        $totalGrupos = 0.0;

        if ($tipoPreco === 'preco_item') {
            foreach ($item['grupos'] ?? [] as $grupo) {
                foreach (array_filter($grupo['itens'] ?? [], fn ($i) => ($i['quantidade'] ?? 0) > 0) as $itemCombo) {
                    $entrada = $entradasItem->get($itemCombo['referencia_id']);
                    if (! $entrada) {
                        throw new Exception('Um dos itens do combo não está disponível nesta loja. Atualize a página e tente novamente.');
                    }
                    $preco = (float) $entrada->preco_snapshot;
                    $totalGrupos += $itemCombo['quantidade'] * $preco;
                    $itensCombo[] = [
                        'referencia_id'  => $itemCombo['referencia_id'],
                        'grupo_nome'     => $grupo['nome'],
                        'nome'           => $entrada->nome_snapshot,
                        'preco_unitario' => $preco,
                        'quantidade'     => $itemCombo['quantidade'],
                    ];
                }
            }
        }

        $complementosCombo = [];
        $totalComplementos = 0.0;

        foreach ($item['grupos_complemento'] ?? [] as $gc) {
            foreach (array_filter($gc['complementos'] ?? [], fn ($c) => ($c['quantidade'] ?? 0) > 0) as $complemento) {
                $entrada = $entradasComplemento->get($complemento['referencia_id']);
                if (! $entrada) {
                    throw new Exception('Um dos complementos do combo não está disponível nesta loja. Atualize a página e tente novamente.');
                }
                $preco = (float) $entrada->preco_snapshot;
                $totalComplementos += $complemento['quantidade'] * $preco;
                $complementosCombo[] = [
                    'referencia_id'  => $complemento['referencia_id'],
                    'grupo_nome'     => $gc['nome'],
                    'nome'           => $entrada->nome_snapshot,
                    'preco_unitario' => $preco,
                    'quantidade'     => $complemento['quantidade'],
                ];
            }
        }

        $precoUnitario = $precoBase + $totalGrupos + $totalComplementos;

        $pedidoItem = PedidoItem::create([
            'pedido_id'      => $pedidoId,
            'item_id'        => $combo->id,
            'uuid'           => uuid_create(),
            'nome'           => $combo->nome,
            'quantidade'     => $item['quantidade'],
            'preco_unitario' => $precoUnitario,
            'subtotal'       => $item['quantidade'] * $precoUnitario,
            'tipo'           => 'C',
            'tipo_preco'     => $tipoPreco,
            'observacao'     => $item['observacao'] ?? null,
        ]);

        foreach ($itensCombo as $itemCombo) {
            PedidoComboItem::create([
                'pedido_item_id' => $pedidoItem->id,
                'uuid'           => uuid_create(),
                'referencia_id'  => $itemCombo['referencia_id'],
                'tipo'           => 'item',
                'grupo_nome'     => $itemCombo['grupo_nome'],
                'item_nome'      => $itemCombo['nome'],
                'preco_unitario' => $itemCombo['preco_unitario'],
                'qtde'           => $itemCombo['quantidade'],
            ]);
        }

        foreach ($complementosCombo as $complemento) {
            PedidoComboItem::create([
                'pedido_item_id' => $pedidoItem->id,
                'uuid'           => uuid_create(),
                'referencia_id'  => $complemento['referencia_id'],
                'tipo'           => 'complemento',
                'grupo_nome'     => $complemento['grupo_nome'],
                'item_nome'      => $complemento['nome'],
                'preco_unitario' => $complemento['preco_unitario'],
                'qtde'           => $complemento['quantidade'],
            ]);
        }

        return $item['quantidade'] * $precoUnitario;
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
