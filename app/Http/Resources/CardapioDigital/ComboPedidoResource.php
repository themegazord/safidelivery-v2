<?php

namespace App\Http\Resources\CardapioDigital;

use App\Models\ComboEntrada;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/**
 * @mixin \App\Models\Combo
 */
class ComboPedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $precoCombo = (float) ($this->getAttribute('meta')?->getAttribute('preco_combo') ?? $this->getAttribute('preco') ?? 0);
        $totalInicial = $this->getAttribute('tipo_preco') === 'preco_combo' ? $precoCombo : 0.0;

        return [
            'id' => $this->getAttribute('id'),
            'nome' => $this->getAttribute('nome'),
            'descricao' => $this->getAttribute('descricao'),
            'imagem' => $this->getAttribute('imagem'),
            'tipo_preco' => $this->getAttribute('tipo_preco'),
            'tipo' => 'CON',
            'preco_fixo' => $precoCombo,
            'quantidade' => 1,
            'categoria' => $this->whenLoaded('categoria', fn () => $this->getAttribute('categoria')->only(['id', 'nome'])),
            'preco_unitario' => $totalInicial,
            'grupos' => ComboGrupoPedidoResource::collection($this->whenLoaded('grupos')),
            'grupos_complemento' => $this->whenLoaded('entradas', fn () => $this->formatGruposComplemento()),
            'observacao' => '',
            'total' => $totalInicial,
        ];
    }

    private function formatGruposComplemento(): Collection
    {
        return $this->getAttribute('entradas')
            ->filter(fn (ComboEntrada $entrada) => $entrada->getAttribute('grupoComplemento') !== null)
            ->groupBy(fn (ComboEntrada $entrada) => $entrada->getAttribute('grupoComplemento')->getAttribute('id'))
            ->map(fn (Collection $entradas) => [
                'id' => $entradas->first()->getAttribute('grupoComplemento')->getAttribute('id'),
                'nome' => $entradas->first()->getAttribute('grupoComplemento')->getAttribute('nome'),
                'obrigatorio' => (bool) $entradas->first()->getAttribute('grupoComplemento')->getAttribute('obrigatoriedade'),
                'qtd_minima' => (int) $entradas->first()->getAttribute('grupoComplemento')->getAttribute('qtd_minima'),
                'qtd_maxima' => (int) $entradas->first()->getAttribute('grupoComplemento')->getAttribute('qtd_maxima'),
                'quantidade_selecionada' => 0,
                'bloqueado' => false,
                'complementos' => $entradas->mapWithKeys(fn (ComboEntrada $entrada) => [
                    $entrada->getAttribute('referencia_id') => [
                        'referencia_id' => $entrada->getAttribute('referencia_id'),
                        'nome' => $entrada->getAttribute('nome_snapshot'),
                        'preco' => (float) $entrada->getAttribute('preco_snapshot'),
                        'quantidade' => 0,
                    ],
                ]),
            ]);
    }
}
