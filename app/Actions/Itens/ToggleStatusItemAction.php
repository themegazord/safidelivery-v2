<?php

namespace App\Actions\Itens;

use App\Models\Empresa;
use App\Models\Item;
use App\Services\IFOOD\ApiExternalIfood;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;

class ToggleStatusItemAction {
    public function handle(int $item_id, int $categoria_id, bool $exportaDadosIfood, Empresa $empresa): bool {
        try {
            $itemAtual = Item::withTrashed()
                ->where('categoria_id', $categoria_id)
                ->where('id', $item_id)
                ->firstOrFail();

            $itemAtual->trashed() ? $itemAtual->restore() : $itemAtual->delete();

            if ($exportaDadosIfood) {
                $api = app(ApiExternalIfood::class);

                $api->updateStatusItem($empresa, $itemAtual);
            }

            return $itemAtual->trashed();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Item não foi encontrado.', $mnfe->getCode(), $mnfe);
        } catch (Exception $e) {
            throw new Exception('Não foi possivel realizar a remoção do item, por favor, entrar em contato com o suporte', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
