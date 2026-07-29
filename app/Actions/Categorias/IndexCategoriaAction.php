<?php

namespace App\Actions\Categorias;

use App\Models\Cardapio;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class IndexCategoriaAction
{
  public function handle(Cardapio $cardapio): Collection
  {
    return $cardapio->categorias()
      ->with(['tamanhos', 'massas', 'bordas'])
      ->withCount('itens')
      ->orderBy('ordem', 'asc')
      ->withTrashed()
      ->get();
  }

  public function carregaCategoriaStatus(Collection $categorias): array
  {
    return $categorias->map(function ($cat) {
      /** @var \App\Models\Categoria $cat */
      return [
        'id' => $cat->getAttribute('id'),
        'inativo' => $cat->trashed(),
      ];
    })->toArray();
  }

  public function filtraCategoriasAtivasHoje(Collection $categorias, string $timezone): Collection {
    return $categorias->filter(fn ($categoria) => in_array(Carbon::now($timezone)->dayOfWeek(), $categoria->getAttribute('dias_funcionamento')))->values();
  }
}
