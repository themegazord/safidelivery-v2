<?php

namespace App\Actions\Itens;

use App\Models\ImagemTemporaria;
use App\Traits\TrataMGCObjectStore;
use Illuminate\Http\UploadedFile;

class StoreImagemItemAction {
  use TrataMGCObjectStore;

  public function handle(UploadedFile $file): string {
    $bucket = env('MGC_BUCKET');
    $url = $this->uploadImagem($bucket, $file);

    // Registrada como pendente: só deixa de ser candidata à limpeza
    // automática quando o item que a usa for efetivamente salvo.
    ImagemTemporaria::query()->create([
      'bucket_key' => $this->extrairKeyDoLinkImagem($bucket, $url),
      'url' => $url,
    ]);

    return $url;
  }
}