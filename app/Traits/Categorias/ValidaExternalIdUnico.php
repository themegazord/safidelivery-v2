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

  public function validarExternalIdUnicoParaEdicao(
        array $tamanhos,
        array $massas,
        array $bordas,
        int $categoriaId,
        int $cardapioId
    ): ?string {
        $tipoNomes = [
            'PIZ' => 'sabor de pizza',
            'PRE' => 'item preparado',
            'BEB' => 'bebida',
            'IND' => 'item industrializado',
        ];

        // Coleta todos os external_ids sendo enviados no request
        $todosExternalIds = [];
        foreach (['tamanho' => $tamanhos, 'massa' => $massas, 'borda' => $bordas] as $tipo => $items) {
            foreach ($items as $item) {
                if (empty($item['external_id'])) {
                    continue;
                }

                $externalId = $item['external_id'];

                // Verifica se já foi usado em outro tipo (tamanho vs massa vs borda) nesta categoria
                foreach ($todosExternalIds as $tipoAnterior => $dadosAnterior) {
                    if ($tipoAnterior !== $tipo && $dadosAnterior['external_id'] === $externalId) {
                        return "Código PDV [{$externalId}] informado na {$tipo} [{$item['nome']}] já está sendo usado na {$tipoAnterior} [{$dadosAnterior['nome']}] desta categoria";
                    }
                }

                $todosExternalIds["{$tipo}_{$item['nome']}"] = [
                    'tipo' => $tipo,
                    'nome' => $item['nome'],
                    'external_id' => $externalId,
                ];
            }
        }

        // Validações originais (contra Item e outras categorias)
        $itensParaValidar = [
            'tamanho' => $tamanhos,
            'massa' => $massas,
            'borda' => $bordas,
        ];

        foreach ($itensParaValidar as $tipo => $items) {
            foreach ($items as $item) {
                if (empty($item['external_id'])) {
                    continue;
                }

                // 1. Verifica se já existe na tabela Item do mesmo cardápio
                $possivelItem = Item::where('external_id', $item['external_id'])
                    ->whereHas('categoria', function ($query) use ($cardapioId) {
                        $query->where('cardapio_id', $cardapioId);
                    })
                    ->first();
                if (! is_null($possivelItem)) {
                    $tipoExistente = $tipoNomes[$possivelItem->tipo] ?? 'item';

                    return "Código PDV informado na {$tipo} [{$item['nome']}] já está sendo usado no {$tipoExistente} [{$possivelItem->nome}]";
                }

                // 2. Verifica se já existe em QUALQUER tipo (tamanho, massa, borda) de QUALQUER categoria do mesmo cardápio
                $conflitos = [];

                // Busca em tamanhos
                $conflitoTamanho = CategoriaTamanho::where('external_id', $item['external_id'])
                    ->when(! empty($item['id']), fn ($q) => $q->where('id', '!=', $item['id']))
                    ->whereHas('categoria', function ($query) use ($cardapioId) {
                        $query->where('cardapio_id', $cardapioId);
                    })
                    ->first();
                if ($conflitoTamanho) {
                    $conflitos[] = [
                        'tipo' => 'tamanho',
                        'registro' => $conflitoTamanho,
                    ];
                }

                // Busca em massas
                $conflitoMassa = CategoriaMassa::where('external_id', $item['external_id'])
                    ->when(! empty($item['id']), fn ($q) => $q->where('id', '!=', $item['id']))
                    ->whereHas('categoria', function ($query) use ($cardapioId) {
                        $query->where('cardapio_id', $cardapioId);
                    })
                    ->first();
                if ($conflitoMassa) {
                    $conflitos[] = [
                        'tipo' => 'massa',
                        'registro' => $conflitoMassa,
                    ];
                }

                // Busca em bordas
                $conflitoBorda = CategoriaBorda::where('external_id', $item['external_id'])
                    ->when(! empty($item['id']), fn ($q) => $q->where('id', '!=', $item['id']))
                    ->whereHas('categoria', function ($query) use ($cardapioId) {
                        $query->where('cardapio_id', $cardapioId);
                    })
                    ->first();
                if ($conflitoBorda) {
                    $conflitos[] = [
                        'tipo' => 'borda',
                        'registro' => $conflitoBorda,
                    ];
                }

                // Se encontrou conflito, retorna mensagem
                if (! empty($conflitos)) {
                    $conflito = $conflitos[0];
                    $registroConflito = $conflito['registro'];
                    $tipoConflito = $conflito['tipo'];

                    $categoriaConflito = \App\Models\Categoria::find($registroConflito->categoria_id);
                    $nomeCategoria = $categoriaConflito ? $categoriaConflito->nome : "ID {$registroConflito->categoria_id}";

                    if ($registroConflito->categoria_id == $categoriaId) {
                        return "Código PDV [{$item['external_id']}] informado na {$tipo} [{$item['nome']}] já está sendo usado na {$tipoConflito} [{$registroConflito->nome}] desta categoria";
                    } else {
                        return "Código PDV [{$item['external_id']}] informado na {$tipo} [{$item['nome']}] já está sendo usado na {$tipoConflito} [{$registroConflito->nome}] da categoria [{$nomeCategoria}]";
                    }
                }

                // 3. Verifica duplicação dentro do próprio array de items sendo enviados
                $externalIdsNoArray = array_filter(array_column($items, 'external_id'));
                $countOccurrences = array_count_values($externalIdsNoArray);

                if ($countOccurrences[$item['external_id']] > 1) {
                    return "Código PDV [{$item['external_id']}] está duplicado na {$tipo}";
                }
            }
        }

        return null;
    }

    private function validarExternalIdItem(?string $externalId, string $nomeItem, int $cardapioId): ?string
    {
        if (empty($externalId)) {
            return null;
        }

        $tipoNomes = [
            'PIZ' => 'sabor de pizza',
            'PRE' => 'item preparado',
            'BEB' => 'bebida',
            'IND' => 'item industrializado',
        ];

        // Verifica se já existe outro item com este external_id
        $itemExistente = Item::where('external_id', $externalId)
            ->whereHas('categoria', function ($query) use ($cardapioId) {
                $query->where('cardapio_id', $cardapioId);
            })
            ->first();

        if (! is_null($itemExistente)) {
            $tipoExistente = $tipoNomes[$itemExistente->tipo] ?? 'item';

            return "Código PDV [{$externalId}] informado no item [{$nomeItem}] já está sendo usado no {$tipoExistente} [{$itemExistente->nome}]";
        }

        // Verifica se já existe nas tabelas de categorias
        $existeEmTamanho = CategoriaTamanho::where('external_id', $externalId)
            ->whereHas('categoria', function ($query) use ($cardapioId) {
                $query->where('cardapio_id', $cardapioId);
            })
            ->first();
        if (! is_null($existeEmTamanho)) {
            return "Código PDV [{$externalId}] informado no item [{$nomeItem}] já está sendo usado no tamanho [{$existeEmTamanho->nome}]";
        }

        $existeEmMassa = CategoriaMassa::where('external_id', $externalId)
            ->whereHas('categoria', function ($query) use ($cardapioId) {
                $query->where('cardapio_id', $cardapioId);
            })
            ->first();
        if (! is_null($existeEmMassa)) {
            return "Código PDV [{$externalId}] informado no item [{$nomeItem}] já está sendo usado na massa [{$existeEmMassa->nome}]";
        }

        $existeEmBorda = CategoriaBorda::where('external_id', $externalId)
            ->whereHas('categoria', function ($query) use ($cardapioId) {
                $query->where('cardapio_id', $cardapioId);
            })
            ->first();
        if (! is_null($existeEmBorda)) {
            return "Código PDV [{$externalId}] informado no item [{$nomeItem}] já está sendo usado na borda [{$existeEmBorda->nome}]";
        }

        $existeEmComplemento = Complemento::where('external_id', $externalId)
            ->whereHas('grupos.item.categoria', function ($query) use ($cardapioId) {
                $query->where('cardapio_id', $cardapioId);
            })
            ->first();
        if (! is_null($existeEmComplemento)) {
            return "Código PDV [{$externalId}] informado no item [{$nomeItem}] já está sendo usado no complemento [{$existeEmComplemento->nome}]";
        }

        return null;
    }
}
