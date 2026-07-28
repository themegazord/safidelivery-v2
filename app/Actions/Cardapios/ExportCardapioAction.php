<?php

namespace App\Actions\Cardapios;

use App\Models\Cardapio;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportCardapioAction
{
  public function handle(int $cardapio_id, int $empresa_id, string $tipo)
  {
    $cardapio = Cardapio::query()
      ->where('id', $cardapio_id)
      ->where('empresa_id', $empresa_id)
      ->firstOrFail();

    return match ($tipo) {
      'pdf' => Pdf::loadView('pdfs.cardapio', ['cardapioAtual' => $cardapio])
        ->setPaper('a4', 'portrait'),
      default => abort(422, 'Tipo de exportação inválido.'),
    };
  }
}
