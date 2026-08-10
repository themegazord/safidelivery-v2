<?php

namespace App\Actions\Itens;

use App\Models\Cardapio;
use Illuminate\Support\Collection;

class IndexItemPorCategoriaAction
{
    public function handle(Cardapio $cardapio, string $categoria_id): Collection
    {
        $categoria = $cardapio->categorias()
            ->withTrashed()
            ->with(['itens' => fn($query) => $query->withTrashed()->with('precosItemPizza')])
            ->findOrFail($categoria_id);

        return $categoria->itens->each(function ($item) {
            $item->setAttribute('trashed', $item->deleted_at !== null);
        });
    }
}
