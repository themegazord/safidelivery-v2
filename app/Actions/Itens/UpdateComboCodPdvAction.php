<?php

namespace App\Actions\Itens;

use App\Models\Combo;
use App\Traits\Categorias\ValidaExternalIdUnico;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;

class UpdateComboCodPdvAction
{
    use ValidaExternalIdUnico;

    public function handle(?string $externalId, int $comboId, int $categoriaId, int $cardapioId): void
    {
        try {
            $combo = Combo::withTrashed()
                ->where('categoria_id', $categoriaId)
                ->where('id', $comboId)
                ->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Combo não foi encontrado.', $mnfe->getCode(), $mnfe);
        }

        if (! empty($externalId)) {
            $conflito = $this->validarExternalIdItemParaEdicao($externalId, $combo->getAttribute('nome'), $comboId, $cardapioId);

            if ($conflito) {
                throw new Exception($conflito, Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $combo->update(['external_id' => $externalId ?: null]);
    }
}
