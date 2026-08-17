<?php

namespace App\Actions\GrupoComplementos;

use App\Models\Cardapio;
use App\Models\GrupoComplemento;
use Illuminate\Pagination\LengthAwarePaginator;

class IndexGruposComplementoCardapioAction
{
    public function handle(Cardapio $cardapio, array $filtros): LengthAwarePaginator
    {
        $query = GrupoComplemento::query()
            ->withTrashed()
            ->whereNotNull('item_id')
            ->with(['item' => fn ($q) => $q->withTrashed()])
            ->whereHas('item', function ($q) use ($cardapio) {
                $q->withTrashed()->whereHas('categoria', function ($qc) use ($cardapio) {
                    $qc->where('cardapio_id', $cardapio->getAttribute('id'));
                });
            });

        if (! empty($filtros['nome'])) {
            $query->where('nome', 'like', '%'.$filtros['nome'].'%');
        }

        $porPagina = (int) ($filtros['por_pagina'] ?? 10);

        return $query->orderBy('nome')->paginate($porPagina)->withQueryString();
    }
}
