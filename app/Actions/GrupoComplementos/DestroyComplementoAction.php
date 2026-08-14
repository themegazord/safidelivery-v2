<?php

namespace App\Actions\GrupoComplementos;

use App\Models\Complemento;
use App\Models\GrupoComplemento;
use App\Models\Item;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;

class DestroyComplementoAction {
    public function handle(Item $item, string $grupo_id, string $complemento_id): void {
        try {
            $grupo = GrupoComplemento::query()
                ->where('item_id', $item->getAttribute('id'))
                ->where('id', $grupo_id)
                ->firstOrFail();

            $complemento = Complemento::query()
                ->where('grupo_id', $grupo->getAttribute('id'))
                ->where('id', $complemento_id)
                ->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Complemento não foi encontrado.', $mnfe->getCode(), $mnfe);
        }

        $totalComplementosDoGrupo = Complemento::query()->where('grupo_id', $grupo->getAttribute('id'))->count();

        if ($totalComplementosDoGrupo <= 1) {
            throw new Exception('Não é possível remover o último complemento do grupo. Remova o grupo inteiro caso não precise mais dele.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $complemento->delete();
        } catch (Exception $e) {
            throw new Exception('Não foi possível remover o complemento, por favor, entre em contato com o suporte', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
