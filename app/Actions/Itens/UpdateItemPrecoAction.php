<?php

namespace App\Actions\Itens;

use App\Models\Item;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class UpdateItemPrecoAction
{
    public function handle(float $valor, int $itemId, int $categoriaId): void
    {
        try {
            $item = Item::withTrashed()
                ->where('categoria_id', $categoriaId)
                ->where('id', $itemId)
                ->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Item não foi encontrado.', $mnfe->getCode(), $mnfe);
        }

        $campo = $item->getAttribute('desconto') ? 'valor_desconto' : 'preco';

        $item->update([$campo => $valor]);
    }
}
