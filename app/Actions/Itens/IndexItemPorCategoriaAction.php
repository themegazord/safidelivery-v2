<?php

namespace App\Actions\Itens;

use App\Models\Cardapio;

class IndexItemPorCategoriaAction
{
    public function handle(Cardapio $cardapio, string $categoria_id): array
    {
        $categoria = $cardapio->categorias()
            ->withTrashed()
            ->with([
                'itens' => fn ($query) => $query->withTrashed()->where('tipo', '!=', 'CON')->with('precosItemPizza'),
                'combos' => fn ($query) => $query->withTrashed()->withCount('grupos')->with('meta'),
            ])
            ->findOrFail($categoria_id);

        $itens = $categoria->itens->each(function ($item) {
            $item->setAttribute('trashed', $item->deleted_at !== null);
        });

        $combos = $categoria->combos->each(function ($combo) {
            $combo->setAttribute('trashed', $combo->deleted_at !== null);
            $combo->setAttribute('preco_combo', $combo->meta?->preco_combo);
        });

        return [
            'itens' => $itens,
            'combos' => $combos,
        ];
    }
}
