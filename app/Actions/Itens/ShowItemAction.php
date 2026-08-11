<?php

namespace App\Actions\Itens;

use App\Models\Item;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;

class ShowItemAction {
    public function handle(int $categoria_id, int $item_id): Item {
        try {
            return Item::withTrashed()
                ->with(['precosItemPizza.tamanho', 'grupo_complemento.complementos'])
                ->where('categoria_id', $categoria_id)
                ->where('id', $item_id)
                ->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new ModelNotFoundException('Item não encontrado', $mnfe->getCode(), $mnfe);
        } catch (Exception $e) {
            throw new Exception('Não foi possível realizar a consulta do item. Por favor, entrar em contato com o suporte', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
