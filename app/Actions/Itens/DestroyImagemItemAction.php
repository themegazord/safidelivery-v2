<?php

namespace App\Actions\Itens;

use App\Models\ImagemTemporaria;
use App\Traits\TrataMGCObjectStore;
use Exception;
use Illuminate\Support\Facades\Log;

class DestroyImagemItemAction {
  use TrataMGCObjectStore;

  public function handle(string $url): void {
    $registro = ImagemTemporaria::query()->where('url', $url)->first();

    // Já vinculada a um item salvo: não é uma imagem pendente, não remove.
    if ($registro && $registro->item_id !== null) {
      return;
    }

    try {
      $this->removeImagem(env('MGC_BUCKET'), $url);
    } catch (Exception $e) {
      Log::warning('Falha ao remover imagem pendente do bucket MGC; será removida pela limpeza agendada.', [
        'url' => $url,
        'erro' => $e->getMessage(),
      ]);
      return;
    }

    $registro?->delete();
  }
}
