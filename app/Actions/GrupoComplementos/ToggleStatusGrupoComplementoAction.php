<?php

namespace App\Actions\GrupoComplementos;

use App\Models\GrupoComplemento;
use App\Models\Item;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ToggleStatusGrupoComplementoAction
{
    public function handle(Item $item, string $grupo_id): bool
    {
        try {
            $grupo = GrupoComplemento::withTrashed()
                ->where('item_id', $item->getAttribute('id'))
                ->where('id', $grupo_id)
                ->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Grupo de complemento não foi encontrado.', $mnfe->getCode(), $mnfe);
        }

        $grupo->trashed() ? $grupo->restore() : $grupo->delete();

        return $grupo->trashed();
    }
}
