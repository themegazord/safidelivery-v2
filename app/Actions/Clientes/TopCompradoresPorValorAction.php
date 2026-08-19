<?php

namespace App\Actions\Clientes;

use App\Models\Cliente;
use App\Models\Empresa;

class TopCompradoresPorValorAction
{
    public function handle(Empresa $empresa): \Illuminate\Database\Eloquent\Collection
    {
        return Cliente::query()
            ->select(['clientes.id', 'clientes.nome', 'clientes.telefone'])
            ->selectRaw('SUM(financeiro_pedido.subtotal_itens) as valor_total_gasto')
            ->selectRaw('COUNT(pedidos.id) as total_pedidos')
            ->join('pedidos', 'pedidos.cliente_id', '=', 'clientes.id')
            ->join('financeiro_pedido', 'financeiro_pedido.pedido_id', '=', 'pedidos.id')
            ->where('pedidos.empresa_id', $empresa->getAttribute('id'))
            ->whereIn('pedidos.status', ['entregue', 'pedido feito'])
            ->whereNull('pedidos.deleted_at')
            ->groupBy('clientes.id', 'clientes.nome', 'clientes.telefone')
            ->orderByDesc('valor_total_gasto')
            ->limit(10)
            ->get();
    }
}
