<?php

namespace App\Actions\Cardapios;

use App\Models\Cardapio;
use Illuminate\Support\Facades\Log;

class UpdateCardapioAction
{
  public function handle(array $dados, int $cardapio_id, int $empresa_id): Cardapio
  {
    $cardapio = Cardapio::query()
      ->where('id', $cardapio_id)
      ->where('empresa_id', $empresa_id)
      ->firstOrFail();

    $cardapio->update(collect($dados)->except(['id', 'empresa_id'])->toArray());

    Log::warning('Cardapio atualizado', [$cardapio]);

    return $cardapio;
  }
}
