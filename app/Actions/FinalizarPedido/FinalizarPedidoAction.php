<?php

namespace App\Actions\FinalizarPedido;

use App\Models\CategoriaBorda;
use App\Models\CategoriaMassa;
use App\Models\Complemento;
use App\Models\FinanceiroPedido;
use App\Models\Item;
use App\Models\Mesa;
use App\Models\Pedido;
use App\Models\PedidoComboItem;
use App\Models\PedidoComplemento;
use App\Models\PedidoItem;
use App\Models\PedidoSaborPizza;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FinalizarPedidoAction
{
    public function handle(
        array $pedido,
        ?string $forma_pagamento,
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
    ): Pedido {
        return DB::transaction(function () use (
            $pedido,
            $forma_pagamento,
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

                $qtdMaximaMesa = Mesa::query()->where('empresa_id', $empresa_id)->max('mesa');
                if ($mesa > $qtdMaximaMesa) {
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

            // TODO: Status 'confirmar pix' — implementar quando integração Pagar.me estiver pronta
            // TODO: Status 'aguardando_item_premio' — implementar quando fidelidade estiver pronta
            $dadosPedido['status'] = $tipo_funcionamento === 'mesa' ? 'pedido feito' : 'pendente';

            $pedidoCadastrado = Pedido::create($dadosPedido);

            $financeiro = [
                'uuid'               => uuid_create(),
                'pedido_id'          => $pedidoCadastrado->id,
                'forma_pagamento_id' => $tipo_funcionamento !== 'mesa' ? $forma_pagamento : null,
                'subtotal_itens'     => $subtotal,
                'total'              => $tipo_funcionamento !== 'mesa' ? ($subtotal + floatval($frete ?? 0) - $valorDesconto - $cashbackUtilizado) : $subtotal,
                'valor_desconto'     => $valorDesconto > 0 ? $valorDesconto : null,
                'cashback_utilizado' => $cashbackUtilizado,
            ];

            // TODO: Troco para pagamento em dinheiro — implementar quando formas de pagamento estiverem prontas
            // TODO: Múltiplas formas de pagamento (FinanceiroPedidoPagamento) — implementar quando a tela estiver pronta

            FinanceiroPedido::create($financeiro);

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

            if ($clienteAutenticado) {
                (new GeraCreditoCashbackAction())->handle(
                    $empresa_id,
                    $clienteAutenticado->id,
                    $pedidoCadastrado,
                    $tipo_funcionamento,
                    $subtotal,
                    $cashbackUtilizado,
                );
            }

            // TODO: Aplicar recompensa de fidelidade — implementar quando FidelidadeConfig CRUD estiver pronto
            // TODO: Gerar pedido PIX na Pagar.me — implementar quando integração estiver pronta

            return $pedidoCadastrado;
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
}
