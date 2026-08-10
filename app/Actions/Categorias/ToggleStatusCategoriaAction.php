<?php

namespace App\Actions\Categorias;

use App\Models\Categoria;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;


class ToggleStatusCategoriaAction {
    public function handle(int $cardapio_id, int $categoria_id) {
        try {
            $categoriaAtual = Categoria::withTrashed()
                ->where('cardapio_id', $cardapio_id)
                ->where('id', $categoria_id)
                ->firstOrFail();

            $categoriaAtual->trashed() ? $categoriaAtual->restore() : $categoriaAtual->delete();

            return $categoriaAtual->trashed();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Categoria não encontrada.', $mnfe->getCode(), $mnfe);
        } catch (Exception $e) {
            throw new Exception('Ocorreu um problema ao tentar alterar o status dessa categoria, por favor, entre em contato com o suporte.', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
