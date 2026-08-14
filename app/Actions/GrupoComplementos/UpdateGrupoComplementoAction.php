<?php

namespace App\Actions\GrupoComplementos;

use App\Models\GrupoComplemento;
use App\Models\Item;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;

class UpdateGrupoComplementoAction {
    public function handle(array $dados, Item $item, string $grupo_id): void {
        try {
            $grupo = GrupoComplemento::query()
                ->where('item_id', $item->getAttribute('id'))
                ->where('id', $grupo_id)
                ->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Grupo de complemento não foi encontrado.', $mnfe->getCode(), $mnfe);
        }

        try {
            $grupo->update([
                'nome' => $dados['nome'],
                'obrigatoriedade' => $dados['obrigatoriedade'],
                'qtd_minima' => $dados['qtd_minima'],
                'qtd_maxima' => $dados['qtd_maxima'],
            ]);
        } catch (Exception $e) {
            throw new Exception('Não foi possível editar o grupo de complemento, por favor, entre em contato com o suporte', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
