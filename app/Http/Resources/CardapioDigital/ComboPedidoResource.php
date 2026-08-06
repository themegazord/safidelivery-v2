<?php

namespace App\Http\Resources\CardapioDigital;

use App\Models\ComboEntrada;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class ComboPedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $precoCombo = (float) ($this->meta?->preco_combo ?? $this->preco ?? 0);

        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'descricao' => $this->descricao,
            'imagem' => $this->imagem,
            'tipo_preco' => $this->tipo_preco,
            'tipo' => 'CON',
            'preco_fixo' => $precoCombo,
            'quantidade' => 1,
            'categoria' => $this->whenLoaded('categoria', fn () => $this->categoria->only(['id', 'nome'])),
            'preco_unitario' => $this->tipo_preco === 'preco_combo' ? $precoCombo : 0.0,
            'grupos' => ComboGrupoPedidoResource::collection($this->whenLoaded('grupos')),
            'grupos_complemento' => $this->whenLoaded('entradas', fn () => $this->formatGruposComplemento()),
            'observacao' => '',
            'total' => $precoCombo,
        ];
    }

    private function formatGruposComplemento(): Collection
    {
        return $this->entradas
            ->filter(fn (ComboEntrada $entrada) => $entrada->grupoComplemento !== null)
            ->groupBy(fn (ComboEntrada $entrada) => $entrada->grupoComplemento->getAttribute('id'))
            ->map(fn (Collection $entradas) => [
                'id' => $entradas->first()->grupoComplemento->getAttribute('id'),
                'nome' => $entradas->first()->grupoComplemento->getAttribute('nome'),
                'obrigatorio' => (bool) $entradas->first()->grupoComplemento->getAttribute('obrigatoriedade'),
                'qtd_minima' => (int) $entradas->first()->grupoComplemento->getAttribute('qtd_minima'),
                'qtd_maxima' => (int) $entradas->first()->grupoComplemento->getAttribute('qtd_maxima'),
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
