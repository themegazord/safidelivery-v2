<?php

namespace App\Services\Empresa\CardapioDigital;

use App\Models\Empresa;
use App\Models\Item;
use Illuminate\Database\Eloquent\Collection;

class CardapioService
{
  public Collection $cardapiosLoja;

  public function categoriasDisponiveis(Empresa $empresa, string $tipo_funcionamento): array
  {
    $categorias = [];
    $hoje = now()->dayOfWeek;
    $this->carregaCardapios($empresa, $tipo_funcionamento);

    foreach ($this->cardapiosLoja as $cardapio) {
      $diasCardapio = array_map('intval', $cardapio->dias_funcionamento ?? []);
      if (in_array($hoje, $diasCardapio)) {
        foreach ($cardapio->categorias as $categoria) {
          $diasCategoria = array_map('intval', $categoria->dias_funcionamento ?? []);
          if (in_array($hoje, $diasCategoria)) {
            $categorias[] = [
              'id' => $categoria->id,
              'nome' => $categoria->nome,
            ];
          }
        }
      }
    }

    return $categorias;
  }

  public function cardapioHoje(): array
  {
    $hoje = now()->dayOfWeek;
    foreach ($this->cardapiosLoja as $cardapio) {
      $diasCardapio = array_map('intval', $cardapio->dias_funcionamento ?? []);
      if (in_array($hoje, $diasCardapio)) {
        return $cardapio->toArray();
      }
    }
    return [];
  }

  public function getItemPedido(int $item_id): array
  {
    $item = Item::query()
      ->with('grupo_complemento.complementos')
      ->find($item_id, ['id', 'nome', 'preco', 'desconto', 'valor_desconto', 'descricao', 'imagem']);

    return [
      'item' => [
        ...$item->only(['id', 'nome', 'preco', 'desconto', 'valor_desconto', 'descricao', 'imagem', 'tipo']),
        'quantidade' => 1,
        'observacao' => "",
        'total' => (bool) $item->getAttribute('desconto') ? $item->getAttribute('valor_desconto') : $item->getAttribute('preco'),
        'grupo_complemento' => $item->grupo_complemento->map(fn($grupo) => [
          ...$grupo->only(['id', 'item_id', 'nome', 'obrigatoriedade', 'qtd_minima', 'qtd_maxima']),
          'bloqueado' => false,
          'complementos' => $grupo->complementos->map(fn($complemento) => [
            ...$complemento->only(['id', 'grupo_id', 'nome', 'descricao', 'preco', 'status']),
            'quantidade' => 0,
          ])->values()->toArray(),
        ])->values()->toArray(),
      ],
    ];
  }

  private function carregaCardapios(Empresa $empresa, string $tipo_funcionamento): void
  {
    $this->cardapiosLoja = $empresa->cardapios()
      ->where('tipo_funcionamento', $tipo_funcionamento)
      ->select([
        'id',
        'nome',
        'descricao',
        'dias_funcionamento',
        'tipo_funcionamento',
      ])
      ->with([
        'categorias' => fn($q) => $q
          ->orderBy('ordem', 'asc')
          ->select([
            'id',
            'cardapio_id',
            'tipo',
            'nome',
            'dias_funcionamento',
            'ordem',
          ])
          ->with([
            'itens' => fn($q) => $q
              ->whereNotIn('tipo', ['CON'])
              ->select([
                'id',
                'categoria_id',
                'nome',
                'descricao',
                'preco',
                'desconto',
                'valor_desconto',
                'imagem',
                'peso',
                'qtde_pessoas',
                'classificacao',
                'dias_funcionamento',
              ])
              ->with([
                'grupo_complemento' => fn($q) => $q
                  ->select([
                    'id',
                    'item_id',
                    'nome',
                    'qtd_maxima',
                    'obrigatoriedade',
                  ])
                  ->with([
                    'complementos' => fn($q) => $q
                      ->select([
                        'id',
                        'grupo_id',
                        'nome',
                        'preco',
                      ]),
                  ]),
              ]),

            'combos' => fn($q) => $q
              ->select([
                'id',
                'categoria_id',
                'nome',
                'descricao',
                'preco',
                'imagem',
                'dias_funcionamento',
              ]),

            'tamanhos' => fn($q) => $q
              ->select([
                'id',
                'categoria_id',
                'nome',
                'qtde_pedacos',
                'qtde_sabores',
              ])
              ->with([
                'precosPorTamanho' => fn($q) => $q
                  ->where('status', true)
                  ->select([
                    'id',
                    'tamanho_id',
                    'item_id',
                    'preco',
                    'status',
                    'dias_funcionamento',
                  ])
                  ->with([
                    'item' => fn($q) => $q
                      ->select([
                        'id',
                        'nome',
                        'imagem',
                      ]),
                  ]),
              ]),
          ]),
      ])
      ->get();
  }
}
