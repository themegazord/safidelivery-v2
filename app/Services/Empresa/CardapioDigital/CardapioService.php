<?php

namespace App\Services\Empresa\CardapioDigital;

use App\Models\Empresa;
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

  private function carregaCardapios(Empresa $empresa, string $tipo_funcionamento): void
  {
    $this->cardapiosLoja = $empresa->cardapios()
      ->where('tipo_funcionamento', $tipo_funcionamento)
      ->with([
        'categorias' => fn($q) => $q->orderBy('ordem', 'asc')->with([
          'itens' => fn($q) => $q->whereNotIn('tipo', ['CON'])
            ->select(['id', 'categoria_id', 'nome', 'descricao', 'preco', 'desconto', 'valor_desconto', 'imagem', 'peso', 'qtde_pessoas', 'classificacao', 'dias_funcionamento'])
            ->with([
              'grupo_complemento' => fn($q) => $q->select(['id', 'item_id', 'nome', 'qtd_maxima', 'obrigatoriedade'])->with([
                'complementos' => fn($q) => $q->select(['id', 'grupo_id', 'nome', 'preco']),
              ]),
            ]),
          'combos' => fn($q) => $q
            ->select(['id', 'categoria_id', 'nome', 'descricao', 'preco', 'tipo_preco', 'imagem', 'classificacao', 'dias_funcionamento'])
            ->with(['meta' => fn($q) => $q->select(['id', 'combo_id', 'tipo_precificacao', 'preco_combo', 'desconto_combo'])]),
          'tamanhos' => fn($q) => $q
            ->with([
              'precosPorTamanho' => fn($q) => $q->where('status', true)
                ->select(['id', 'tamanho_id', 'item_id', 'preco', 'status', 'dias_funcionamento'])
                ->with([
                  'item' => fn($q) => $q->select(['id', 'nome', 'descricao', 'imagem', 'classificacao', 'dias_funcionamento']),
                ]),
            ]),
          'massas' => fn($q) => $q->select(['id', 'categoria_id', 'nome', 'preco']),
          'bordas' => fn($q) => $q->select(['id', 'categoria_id', 'nome', 'preco']),
        ]),
      ])
      ->get();
  }
}
