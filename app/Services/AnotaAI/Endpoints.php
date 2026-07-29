<?php

namespace App\Services\AnotaAI;

class Endpoints {
  protected string $url = "https://api-menu.anota.ai/partnerauth/v2/";

  public function getEndpointExportacaoCategorias(): string {
    return "{$this->url}nm-category/rest/simple-item/export/v2";
  }
}
