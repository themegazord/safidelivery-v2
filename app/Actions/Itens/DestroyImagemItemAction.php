<?php

namespace App\Actions\Itens;

use App\Models\Item;
use App\Models\ImagemTemporaria;
use App\Traits\TrataMGCObjectStore;
use Exception;
use Illuminate\Support\Facades\Log;

class DestroyImagemItemAction {
  use TrataMGCObjectStore;

  public function handle(string $url): void {
    // Já em uso por um item salvo (mesmo soft-deletado): nunca remove.
    // Não dá pra confiar só no registro de ImagemTemporaria aqui, porque
    // StoreItemAction/UpdateItemAction apagam esse registro assim que o
    // item é salvo com a imagem — ou seja, uma imagem já vinculada pode
    // não ter mais registro nenhum em ImagemTemporaria.
    if (Item::withTrashed()->where('imagem', $url)->exists()) {
      return;
    }

    $registro = ImagemTemporaria::query()->where('url', $url)->first();

    try {
      $this->removeImagem(config('services.mgc.bucket'), $url);
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
