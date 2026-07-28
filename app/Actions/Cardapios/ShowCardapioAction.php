<?php

namespace App\Actions\Cardapios;

use App\Models\Cardapio;

class ShowCardapioAction {
  public function handle(int $cardapio_id, int $empresa_id): Cardapio {
    return Cardapio::query()->where('id', $cardapio_id)->where('empresa_id', $empresa_id)->firstOrFail();
  }
}