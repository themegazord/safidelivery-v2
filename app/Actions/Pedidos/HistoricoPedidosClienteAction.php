<?php

namespace App\Actions\Pedidos;

use App\Models\Cliente;
use App\Models\Empresa;
use Illuminate\Pagination\LengthAwarePaginator;

class HistoricoPedidosClienteAction
{
    public function handle(Empresa $empresa, Cliente $cliente, int $porPagina = 10): array
    {
        $pedidosEntregues = $cliente->pedidos()
            ->where('empresa_id', $empresa->id)
            ->where('status', 'entregue')
            ->with(['itens', 'financeiro'])
            ->get();

        $itensAgrupados = $pedidosEntregues
            ->flatMap(fn ($pedido) => $pedido->itens)
            ->groupBy('nome')
            ->map(fn ($grupo) => [
                'nome' => $grupo->first()->nome,
                'qtde' => $grupo->sum('quantidade'),
            ])
            ->sortByDesc('qtde')
            ->values();

        $tz = $empresa->resolveTimezone();

        /** @var LengthAwarePaginator $paginado */
        $paginado = $cliente->pedidos()
            ->where('empresa_id', $empresa->id)
            ->where('status', 'entregue')
            ->with('financeiro')
            ->orderByDesc('created_at')
            ->paginate($porPagina);

        $paginado->through(fn ($pedido) => [
            'id' => $pedido->id,
            'created_at' => $pedido->created_at->timezone($tz)->format('d/m/Y'),
            'valor' => $pedido->financeiro?->total,
            'forma_pagamento' => $pedido->financeiro?->defineFormaPagamento(),
            'tipo_pedido' => $pedido->defineTipoPedido(),
        ]);

        return [
            'cliente' => [
                'id' => $cliente->id,
                'nome' => $cliente->nome,
                'telefone' => $cliente->telefone,
                'cpf_cnpj' => $cliente->cpf_cnpj,
                'data_nascimento' => $cliente->data_nascimento,
                'endereco' => $cliente->endereco ? [
                    'logradouro' => $cliente->endereco->logradouro,
                    'numero' => $cliente->endereco->numero,
                    'bairro' => $cliente->endereco->bairro,
                    'cidade' => $cliente->endereco->cidade,
                ] : null,
            ],
            'itens_mais_pedidos' => $itensAgrupados,
            'qtde_pedidos' => $pedidosEntregues->count(),
            'total_gasto' => $pedidosEntregues->sum(fn ($p) => $p->financeiro?->total ?? 0),
            'primeiro_pedido' => $pedidosEntregues->sortBy('created_at')->first()?->created_at?->timezone($tz)->format('d/m/Y'),
            'ultimo_pedido' => $pedidosEntregues->sortByDesc('created_at')->first()?->created_at?->timezone($tz)->format('d/m/Y'),
            'pedidos' => $paginado,
        ];
    }
}
