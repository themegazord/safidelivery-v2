<?php

namespace App\Actions\Clientes;

use App\Models\CashbackConfig;
use App\Models\CashbackCredito;
use App\Models\Cliente;
use App\Models\Empresa;
use App\Models\FidelidadeConfig;
use App\Models\FidelidadeProgresso;
use App\Models\Pedido;
use Illuminate\Support\Facades\DB;

class DetalheClienteAction
{
    public function handle(Empresa $empresa, Cliente $cliente, ?FidelidadeConfig $fidelidadeConfig, ?CashbackConfig $cashbackConfig): array
    {
        $empresaId = $empresa->getAttribute('id');
        $clienteId = $cliente->getAttribute('id');

        $cliente->load('enderecos');

        $fidelidadeProgresso = $fidelidadeConfig
            ? FidelidadeProgresso::query()
                ->where('cliente_id', $clienteId)
                ->where('empresa_id', $empresaId)
                ->first()
            : null;

        $historicoCashback = collect();
        $resumoCashback = null;
        if ($cashbackConfig) {
            $historicoCashback = CashbackCredito::query()
                ->where('cliente_id', $clienteId)
                ->where('empresa_id', $empresaId)
                ->orderByDesc('data_gerado')
                ->limit(10)
                ->get();

            $resumoCashback = [
                'saldo_disponivel' => (float) CashbackCredito::query()
                    ->where('cliente_id', $clienteId)
                    ->where('empresa_id', $empresaId)
                    ->where('data_vencimento', '>=', now())
                    ->sum('saldo_restante'),
                'total_gerado' => (float) CashbackCredito::query()
                    ->where('cliente_id', $clienteId)
                    ->where('empresa_id', $empresaId)
                    ->sum('credito_gerado'),
                'total_utilizado' => (float) CashbackCredito::query()
                    ->where('cliente_id', $clienteId)
                    ->where('empresa_id', $empresaId)
                    ->sum(DB::raw('credito_gerado - saldo_restante')),
            ];
        }

        $historicoFidelidade = $fidelidadeConfig
            ? Pedido::query()
                ->with('financeiro')
                ->where('cliente_id', $clienteId)
                ->where('empresa_id', $empresaId)
                ->where(function ($q) {
                    $q->whereNotNull('fidelidade_recompensa_aplicada')
                        ->orWhere('fidelidade_desconto', '>', 0);
                })
                ->whereNull('deleted_at')
                ->orderByDesc('created_at')
                ->limit(10)
                ->get()
            : collect();

        $historicoPedidos = Pedido::query()
            ->with('financeiro')
            ->where('cliente_id', $clienteId)
            ->where('empresa_id', $empresaId)
            ->whereIn('status', ['entregue', 'pedido feito'])
            ->whereNull('deleted_at')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $itensMaisPedidos = DB::table('pedido_itens')
            ->join('pedidos', 'pedidos.id', '=', 'pedido_itens.pedido_id')
            ->where('pedidos.cliente_id', $clienteId)
            ->where('pedidos.empresa_id', $empresaId)
            ->whereIn('pedidos.status', ['entregue', 'pedido feito'])
            ->whereNull('pedidos.deleted_at')
            ->groupBy('pedido_itens.nome')
            ->selectRaw('pedido_itens.nome, SUM(pedido_itens.quantidade) as total_pedido')
            ->orderByDesc('total_pedido')
            ->limit(5)
            ->get();

        $formasPagamento = Pedido::query()
            ->with('financeiro.formaPagamento')
            ->where('cliente_id', $clienteId)
            ->where('empresa_id', $empresaId)
            ->whereIn('status', ['entregue', 'pedido feito'])
            ->whereNull('deleted_at')
            ->get()
            ->map(fn (Pedido $pedido) => $pedido->financeiro)
            ->filter()
            ->groupBy(fn (\App\Models\FinanceiroPedido $financeiro) => $financeiro->defineFormaPagamento())
            ->map(fn ($grupo, $label) => (object) ['forma_pagamento' => $label, 'total' => $grupo->count()])
            ->sortByDesc('total')
            ->values();

        return [
            'cliente' => [
                'id' => $cliente->getAttribute('id'),
                'nome' => $cliente->getAttribute('nome'),
                'telefone' => $cliente->getAttribute('telefone'),
                'email' => $cliente->getAttribute('email'),
                'cpf_cnpj' => $cliente->getAttribute('cpf_cnpj'),
                'enderecos' => $cliente->enderecos->map(fn ($endereco) => [
                    'id' => $endereco->getAttribute('id'),
                    'logradouro' => $endereco->getAttribute('logradouro'),
                    'numero' => $endereco->getAttribute('numero'),
                    'complemento' => $endereco->getAttribute('complemento'),
                    'bairro' => $endereco->getAttribute('bairro'),
                    'cidade' => $endereco->getAttribute('cidade'),
                    'uf' => $endereco->getAttribute('uf'),
                    'cep' => $endereco->getAttribute('cep'),
                ])->values(),
            ],
            'fidelidade_progresso' => $fidelidadeProgresso ? [
                'contador_atual' => $fidelidadeProgresso->getAttribute('contador_atual'),
                'valor_acumulado' => (float) $fidelidadeProgresso->getAttribute('valor_acumulado'),
                'recompensa_disponivel' => (bool) $fidelidadeProgresso->getAttribute('recompensa_disponivel'),
                'recompensa_tipo' => $fidelidadeProgresso->getAttribute('recompensa_tipo'),
                'recompensa_expira_em' => optional($fidelidadeProgresso->getAttribute('recompensa_expira_em'))->toDateString(),
            ] : null,
            'resumo_cashback' => $resumoCashback,
            'historico_cashback' => $historicoCashback->map(fn (CashbackCredito $credito) => [
                'pedido_id' => $credito->getAttribute('pedido_id'),
                'credito_gerado' => (float) $credito->getAttribute('credito_gerado'),
                'saldo_restante' => (float) $credito->getAttribute('saldo_restante'),
                'data_gerado' => $credito->getAttribute('data_gerado'),
                'data_vencimento' => optional($credito->getAttribute('data_vencimento'))->toDateString(),
            ])->values(),
            'historico_fidelidade' => $historicoFidelidade->map(fn (Pedido $pedido) => [
                'id' => $pedido->getAttribute('id'),
                'created_at' => $pedido->getAttribute('created_at')->toIso8601String(),
                'fidelidade_desconto' => (float) $pedido->getAttribute('fidelidade_desconto'),
                'fidelidade_recompensa_aplicada' => $pedido->getAttribute('fidelidade_recompensa_aplicada'),
            ])->values(),
            'historico_pedidos' => $historicoPedidos->map(fn (Pedido $pedido) => [
                'id' => $pedido->getAttribute('id'),
                'created_at' => $pedido->getAttribute('created_at')->toIso8601String(),
                'status' => $pedido->getAttribute('status'),
                'total' => (float) ($pedido->financeiro?->getAttribute('total') ?? 0),
                'forma_pagamento_label' => $pedido->financeiro?->defineFormaPagamento(),
                'fidelidade_recompensa_aplicada' => $pedido->getAttribute('fidelidade_recompensa_aplicada'),
            ])->values(),
            'itens_mais_pedidos' => $itensMaisPedidos->map(fn ($item) => [
                'nome' => $item->nome,
                'total_pedido' => (int) $item->total_pedido,
            ])->values(),
            'formas_pagamento' => $formasPagamento->map(fn ($forma) => [
                'forma_pagamento' => $forma->forma_pagamento,
                'total' => (int) $forma->total,
            ])->values(),
        ];
    }
}
