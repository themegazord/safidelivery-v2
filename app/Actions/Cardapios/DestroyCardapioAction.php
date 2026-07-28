<?php

namespace App\Actions\Cardapios;

use App\Models\Cardapio;
use Exception;

class DestroyCardapioAction
{
  public function handle(string $id, int $empresa_id): void
  {
    try {
      Cardapio::query()->where('id', $id)->where('empresa_id', $empresa_id)->firstOrFail()->delete();
    } catch (Exception $e) {
      throw new Exception('Erro ao remover este cardápio. Entre em contato com suporte para prosseguir', $e->getCode(), $e);
    }
  }
}
