<?php

namespace App\Actions\Itens;

use App\Models\Cardapio;
use App\Models\Item;
use Illuminate\Pagination\LengthAwarePaginator;

class IndexProdutosCardapioAction
{
    public function handle(Cardapio $cardapio, array $filtros): LengthAwarePaginator
    {
        $query = Item::query()
            ->withTrashed()
            ->with(['categoria' => fn ($q) => $q->withTrashed()])
            ->whereHas('categoria', fn ($q) => $q->where('cardapio_id', $cardapio->getAttribute('id')));

        if (($filtros['status'] ?? '') === 'ativo') {
            $query->whereNull('deleted_at');
        } elseif (($filtros['status'] ?? '') === 'inativo') {
            $query->whereNotNull('deleted_at');
        }

        if (! empty($filtros['nome'])) {
            $query->where('nome', 'like', '%'.$filtros['nome'].'%');
        }

        $direcao = ($filtros['ordenacao'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $porPagina = (int) ($filtros['por_pagina'] ?? 10);

        return $query->orderBy('nome', $direcao)->paginate($porPagina)->withQueryString();
    }
}
