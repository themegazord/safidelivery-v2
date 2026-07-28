<?php

namespace App\Actions\Cardapios;

use App\Models\Cardapio;

class StoreCardapioAction {
  public function handle(array $dados): Cardapio {
    return Cardapio::query()->create(collect($dados)->except(['id'])->toArray());
  }
}