<?php

namespace App\Actions\Pedidos;

use App\Models\Empresa;
use Illuminate\Pagination\LengthAwarePaginator;

class IndexTodosPedidosAction
{
    public function handle(Empresa $empresa, array $filtros): LengthAwarePaginator
    {
        $query = $empresa->pedidos()
            ->withTrashed()
            ->when($filtros['busca'] ?? null, function ($query, $busca) {
                $query->where(function ($q) use ($busca) {
                    $q->where('id', 'like', "%{$busca}%")
                        ->orWhere('ifood_display_id', 'like', "%{$busca}%")
                        ->orWhere('nome', 'like', "%{$busca}%")
                        ->orWhere('telefone', 'like', "%{$busca}%")
                        ->orWhereHas('cliente', function ($q) use ($busca) {
                            $q->where('nome', 'like', "%{$busca}%")
                                ->orWhere('telefone', 'like', "%{$busca}%");
                        });
                });
            })
            ->when($filtros['data_inicio'] ?? null, fn ($q, $data) => $q->whereDate('created_at', '>=', $data))
            ->when($filtros['data_fim'] ?? null, fn ($q, $data) => $q->whereDate('created_at', '<=', $data))
            ->when($filtros['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filtros['tipo'] ?? null, fn ($q, $tipo) => $q->where('tipo', $tipo))
            ->when(($filtros['origem'] ?? null) === 'ifood', fn ($q) => $q->whereNotNull('pedido_ifood_id'))
            ->when(($filtros['origem'] ?? null) === 'direto', fn ($q) => $q->whereNull('pedido_ifood_id'))
            ->with(['cliente', 'financeiro'])
            ->orderBy('created_at', 'desc');

        $porPagina = (int) ($filtros['por_pagina'] ?? 15);

        return $query->paginate($porPagina)->withQueryString();
    }
}
