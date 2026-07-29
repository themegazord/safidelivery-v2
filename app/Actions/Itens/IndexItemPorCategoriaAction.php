<?php

namespace App\Actions\Itens;

use App\Models\Cardapio;
use Illuminate\Support\Collection;

class IndexItemPorCategoriaAction
{
  public function handle(Cardapio $cardapio, string $categoria_id): Collection
  {
    $categoria = $cardapio->categorias()
      ->with('itens.precosItemPizza')
      ->findOrFail($categoria_id);

    return $categoria->itens;
  }
}
