<?php

namespace App\Actions\Itens;

use App\Models\Combo;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;

class UpdateComboPrecoAction
{
    public function handle(float $valor, int $comboId, int $categoriaId): void
    {
        try {
            $combo = Combo::withTrashed()
                ->where('categoria_id', $categoriaId)
                ->where('id', $comboId)
                ->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Combo não foi encontrado.', $mnfe->getCode(), $mnfe);
        }

        if ($combo->getAttribute('tipo_preco') !== 'preco_combo') {
            throw new Exception('Esse combo tem o preço definido pela soma dos itens, não é possível editar um valor fixo.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $combo->meta()->updateOrCreate([], ['preco_combo' => $valor]);
    }
}
