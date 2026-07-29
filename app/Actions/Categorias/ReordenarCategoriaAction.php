<?php

namespace App\Actions\Categorias;

use App\Models\Cardapio;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ReordenarCategoriaAction {
  public function handle(array $ordem) {
    try {
      DB::transaction(function () use ($ordem) {
          foreach ($ordem as $id) {
              \App\Models\Categoria::withTrashed()->find($id['id'])->update([
                  'ordem' => $id['ordem'],
              ]);
          }
      });
    } catch (Exception $e) {
      throw new Exception('Erro ao tentar ordenar suas categorias, por favor, entre em contato com o suporte', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
    }
  }
}
