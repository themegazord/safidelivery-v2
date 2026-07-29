<?php

namespace App\Traits\Categorias;

use App\Models\CategoriaBorda;
use App\Models\CategoriaMassa;
use App\Models\CategoriaTamanho;
use App\Models\Complemento;
use App\Models\Item;

trait ValidaExternalIdUnico
{
  public function validarExternalIdUnico(array $items, string $tipo, int $cardapioId): ?string
  {
    $tipoNomes = [
      'PIZ' => 'sabor de pizza',
      'PRE' => 'item preparado',
      'BEB' => 'bebida',
      'IND' => 'item industrializado',
    ];

    foreach ($items as $index => $item) {
      if (empty($item['external_id'])) {
        continue;
      }

      // 1. Verifica se já existe na tabela Item dentro do mesmo cardápio
      $possivelItem = Item::where('external_id', $item['external_id'])
        ->whereHas('categoria', function ($query) use ($cardapioId) {
          $query->where('cardapio_id', $cardapioId);
        })
        ->first();

      if (! is_null($possivelItem)) {
        $tipoExistente = $tipoNomes[$possivelItem->tipo] ?? 'item';

        return "Código PDV informado na {$tipo} [{$item['nome']}] já está sendo usado no {$tipoExistente} [{$possivelItem->nome}]";
      }

      // 2. Verifica se já existe nas tabelas de categorias do mesmo cardápio
      $existeEmTamanho = CategoriaTamanho::where('external_id', $item['external_id'])
        ->whereHas('categoria', function ($query) use ($cardapioId) {
          $query->where('cardapio_id', $cardapioId);
        })
        ->first();
      if (! is_null($existeEmTamanho)) {
        return "Código PDV informado na {$tipo} [{$item['nome']}] já está sendo usado no tamanho [{$existeEmTamanho->nome}]";
      }

      $existeEmMassa = CategoriaMassa::where('external_id', $item['external_id'])
        ->whereHas('categoria', function ($query) use ($cardapioId) {
          $query->where('cardapio_id', $cardapioId);
        })
        ->first();
      if (! is_null($existeEmMassa)) {
        return "Código PDV informado na {$tipo} [{$item['nome']}] já está sendo usado na massa [{$existeEmMassa->nome}]";
      }

      $existeEmBorda = CategoriaBorda::where('external_id', $item['external_id'])
        ->whereHas('categoria', function ($query) use ($cardapioId) {
          $query->where('cardapio_id', $cardapioId);
        })
        ->first();
      if (! is_null($existeEmBorda)) {
        return "Código PDV informado na {$tipo} [{$item['nome']}] já está sendo usado na borda [{$existeEmBorda->nome}]";
      }

      // 3. Verifica duplicação dentro do próprio array
      $externalIdsNoArray = array_column($items, 'external_id');
      $countOccurrences = array_count_values(array_filter($externalIdsNoArray));

      if ($countOccurrences[$item['external_id']] > 1) {
        return "Código PDV [{$item['external_id']}] está duplicado na {$tipo}";
      }
    }
    return null;
  }
}
