<?php

namespace App\Actions\Itens;

use App\Models\Item;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;

class DestroyItemAction {
    public function handle(string $item_id, string $categoria_id): void {
        try {
            $itemAtual = Item::withTrashed()
                ->where('categoria_id', $categoria_id)
                ->where('id', $item_id)
                ->firstOrFail();
            $itemAtual->forceDelete();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Item não foi encontrado.', $mnfe->getCode(), $mnfe);
        } catch (Exception $e) {
            throw new Exception('Não foi possivel realizar a remoção do item, por favor, entrar em contato com o suporte', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
