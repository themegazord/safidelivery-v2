<?php

namespace App\Actions\Itens;

use App\Models\Item;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class UpdateItemImagemAction
{
    public function handle(string $imagem, int $itemId, int $categoriaId): void
    {
        try {
            $item = Item::withTrashed()
                ->where('categoria_id', $categoriaId)
                ->where('id', $itemId)
                ->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Item não foi encontrado.', $mnfe->getCode(), $mnfe);
        }

        $item->update(['imagem' => $imagem]);
    }
}
