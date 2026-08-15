<?php

namespace App\Actions\Itens;

use App\Models\Combo;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;

class ShowComboAction
{
    public function handle(int $categoria_id, int $combo_id): Combo
    {
        try {
            return Combo::withTrashed()
                ->with(['meta', 'grupos' => fn ($query) => $query->orderBy('ordem'), 'grupos.entradas', 'entradasComplementos.grupoComplemento'])
                ->where('categoria_id', $categoria_id)
                ->where('id', $combo_id)
                ->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new ModelNotFoundException('Combo não encontrado', $mnfe->getCode(), $mnfe);
        } catch (Exception $e) {
            throw new Exception('Não foi possível realizar a consulta do combo. Por favor, entrar em contato com o suporte', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
