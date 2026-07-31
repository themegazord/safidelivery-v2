<?php

namespace App\Actions\Itens;

use App\Traits\TrataMGCObjectStore;
use Illuminate\Http\UploadedFile;

class StoreImagemItemAction {
  use TrataMGCObjectStore;
  public function handle(UploadedFile $file): string {
    return $this->uploadImagem(env('MGC_BUCKET'), $file);
  }
}