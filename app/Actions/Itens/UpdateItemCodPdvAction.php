<?php

namespace App\Actions\Itens;

use App\Models\Item;
use App\Traits\Categorias\ValidaExternalIdUnico;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;

class UpdateItemCodPdvAction
{
    use ValidaExternalIdUnico;

    public function handle(?string $externalId, int $itemId, int $categoriaId, int $cardapioId): void
    {
        try {
            $item = Item::withTrashed()
                ->where('categoria_id', $categoriaId)
                ->where('id', $itemId)
                ->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Item não foi encontrado.', $mnfe->getCode(), $mnfe);
        }

        if (! empty($externalId)) {
            $conflito = $this->validarExternalIdItemParaEdicao($externalId, $item->getAttribute('nome'), $itemId, $cardapioId);

            if ($conflito) {
                throw new Exception($conflito, Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $item->update(['external_id' => $externalId ?: null]);
    }
}
