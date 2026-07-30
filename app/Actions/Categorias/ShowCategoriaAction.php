<?php

namespace App\Actions\Categorias;

use App\Models\Categoria;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Response;

class ShowCategoriaAction {
    public function handle(int $cardapio_id, int $categoria_id): Categoria {
        try {
            return Categoria::query()->withTrashed()->where('cardapio_id', $cardapio_id)->where('id', $categoria_id)->with('tamanhos', 'massas', 'bordas')->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception("Categoria não encontrada", $mnfe->getCode());
        } catch (Exception $e) {
            throw new Exception("Não foi possivel realizar a consulta dessa categoria, por favor, entre em contato com o suporte.", Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
