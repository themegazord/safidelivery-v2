<?php

namespace App\Actions\Categorias;

use App\Models\Categoria;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;

class DestroyCategoriaAction {
    public function handle(string $categoria_id, string $cardapio_id) {
        try {
            return Categoria::query()
            ->withTrashed()
            ->where('id', $categoria_id)
            ->where('cardapio_id', $cardapio_id)
            ->firstOrFail()
            ->forceDelete();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Categoria não encontrada.', $mnfe->getCode(), $mnfe);
        } catch (Exception $e) {
            throw new Exception('Ocorreu um problema ao tentar remover essa categoria, por favor, entre em contato com o suporte.', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
