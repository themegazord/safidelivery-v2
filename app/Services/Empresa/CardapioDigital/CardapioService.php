<?php

namespace App\Services\Empresa\CardapioDigital;

use App\Models\CategoriaTamanho;
use App\Models\Combo;
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

    public function getItemPizzaPedido(int $tamanho_id, int $qtdeSabor, int $menorValorTamanho): array
    {
        $categoriaTamanho = CategoriaTamanho::query()
            ->with(['precosPorTamanho.item', 'categoria.massas', 'categoria.bordas'])
            ->find($tamanho_id);

        if (! $categoriaTamanho) {
            return [];
        }

        return [
            'tamanho' => [
                ...$categoriaTamanho->only([
                    'id',
                    'categoria_id',
                    'nome',
                    'qtde_pedacos',
                    'qtde_sabores'
                ]),
                'menorValorTamanho' => $menorValorTamanho,
                'quantidade_sabores_selecionadas' => 0,
                'quantidade_sabor' => $qtdeSabor,
                'quantidade' => 1,
                'observacao' => "",
                'total' => 0,
                'categoria' => [
                    'id' => $categoriaTamanho->getAttribute('categoria_id'),
                    'nome' => $categoriaTamanho->categoria->getAttribute('nome')
                ],
                'massas' => [
                    ...$categoriaTamanho->categoria->massas->map(fn($m) => $m->only([
                        'id',
                        'categoria_id',
                        'nome',
                        'preco'
                    ]))
                ],
                'massaSelecionada' => null,
                'bordas' => [
                    ...$categoriaTamanho->categoria->bordas->map(fn($b) => $b->only([
                        'id',
                        'categoria_id',
                        'nome',
                        'preco'
                    ]))
                ],
                'bordaSelecionada' => null,
                'sabores' => $categoriaTamanho->precosPorTamanho->map(function ($sabor) use ($qtdeSabor) {
                    if ($sabor->item !== null && \in_array(now()->dayOfWeek, array_map('intval', $sabor->dias_funcionamento ?? []))) {
                        return [
                            ...$sabor->only('id'),
                            'item_id' => $sabor->item->id,
                            'nome' => match ($qtdeSabor) {
                                1 => $sabor->item->nome,
                                2 => '1/2 ' . $sabor->item->nome,
                                3 => '1/3 ' . $sabor->item->nome,
                                4 => '1/4 ' . $sabor->item->nome
                            },
                            'preco' => match ($qtdeSabor) {
                                1 => $sabor->preco,
                                2 => ($sabor->preco) / 2,
                                3 => ($sabor->preco) / 3,
                                4 => ($sabor->preco) / 4,
                            },
                            ...$sabor->item->only(['imagem', 'descricao', 'classificacao']),
                            'quantidade' => 0
                        ];
                    }
                    return null;
                })->filter()->values(),
            ]
        ];
    }

    public function setItemComboPedido(int $combo_id): array
    {
        $combo = Combo::with([
            'meta',
            'grupos' => fn($q) => $q->orderBy('ordem')->with([
                'entradas' => fn($q) => $q->where('tipo', 'item'),
            ]),
            'entradas' => fn($q) => $q->where('tipo', 'complemento')->with([
                'grupoComplemento' => fn($q) => $q->select(['id', 'nome', 'qtd_maxima', 'obrigatoriedade']),
            ]),
        ])->find($combo_id);

        return [
            'id' => $combo->getAttribute('id'),
            'nome' => $combo->getAttribute('nome'),
            'descricao' => $combo->getAttribute('descricao'),
            'imagem' => $combo->getAttribute('imagem'),
            'tipo_preco' => $combo->getAttribute('tipo_preco'),
            'preco_fixo' => (float) ($combo->meta?->getAttribute('preco_combo') ?? $combo->getAttribute('preco') ?? 0),
            'quantidade' => 1,
            'preco_unitario' => $combo->getAttribute('tipo_preco') === 'preco_combo' ? (float) ($combo->meta?->getAttribute('preco_combo') ?? $combo->getAttribute('preco') ?? 0) : 0.0,
            'grupos' => $combo->grupos->map(fn(\App\Models\ComboGrupo $grupo) => [
                'id' => $grupo->getAttribute('id'),
                'nome' => $grupo->getAttribute('nome'),
                'obrigatorio' => (bool) ($grupo->configuracao['obrigatorio'] ?? true),
                'qtd_minima'  => (int) ($grupo->configuracao['qtd_minima'] ?? 1),
                'qtd_maxima'  => (int) ($grupo->configuracao['qtd_maxima'] ?? $grupo->getAttribute('qtd_maxima')),
                'quantidade_selecionada' => 0,
                'bloqueado' => false,
                'itens' => $grupo->entradas->map(fn(\App\Models\ComboEntrada $entrada) => [
                    'referencia_id' => $entrada->getAttribute('referencia_id'),
                    'nome' => $entrada->getAttribute('nome_snapshot'),
                    'preco' => (float) $entrada->getAttribute('preco_snapshot'),
                    'quantidade' => 0
                ])
            ]),
            'grupos_complemento' => $combo->entradas
                ->filter(fn(\App\Models\ComboEntrada $entrada) => $entrada->grupoComplemento !== null)
                ->groupBy(fn(\App\Models\ComboEntrada $entrada) => $entrada->grupoComplemento->getAttribute('id'))
                ->map(fn(\Illuminate\Support\Collection $entradas) => [
                    'id'                   => $entradas->first()->grupoComplemento->getAttribute('id'),
                    'nome'                 => $entradas->first()->grupoComplemento->getAttribute('nome'),
                    'obrigatorio'          => (bool) $entradas->first()->grupoComplemento->getAttribute('obrigatoriedade'),
                    'qtd_minima'           => (int) $entradas->first()->grupoComplemento->getAttribute('qtd_minima'),
                    'qtd_maxima'           => (int) $entradas->first()->grupoComplemento->getAttribute('qtd_maxima'),
                    'quantidade_selecionada' => 0,
                    'bloqueado'            => false,
                    'complementos'         => $entradas->mapWithKeys(fn(\App\Models\ComboEntrada $entrada) => [
                        $entrada->getAttribute('referencia_id') => [
                            'referencia_id' => $entrada->getAttribute('referencia_id'),
                            'nome'          => $entrada->getAttribute('nome_snapshot'),
                            'preco'         => (float) $entrada->getAttribute('preco_snapshot'),
                            'quantidade'    => 0,
                        ],
                    ]),
                ]),
            'observacao' => '',
            'total' => 0
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
