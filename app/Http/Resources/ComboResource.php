<?php

namespace App\Http\Resources;

use App\Models\ComboEntrada;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class ComboResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'external_id' => $this->external_id,
            'categoria_id' => $this->categoria_id,
            'nome' => $this->nome,
            'descricao' => $this->descricao,
            'imagem' => $this->imagem,
            'classificacao' => $this->classificacao,
            'dias_funcionamento' => $this->dias_funcionamento,
            'tipo_preco' => $this->tipo_preco,
            'meta' => $this->whenLoaded('meta', fn () => [
                'preco_combo' => $this->meta->preco_combo,
                'desconto_combo' => $this->meta->desconto_combo,
            ]),
            'grupos' => $this->whenLoaded('grupos', fn () => $this->grupos->map(fn ($grupo) => [
                'id' => $grupo->id,
                'nome' => $grupo->nome,
                'ordem' => $grupo->ordem,
                'configuracao' => [
                    'obrigatorio' => $grupo->configuracao['obrigatorio'] ?? true,
                    'qtd_minima' => $grupo->configuracao['qtd_minima'] ?? 1,
                    'qtd_maxima' => $grupo->configuracao['qtd_maxima'] ?? $grupo->qtd_maxima,
                ],
                'entradas' => $grupo->entradas->map(fn ($entrada) => [
                    'referencia_id' => $entrada->referencia_id,
                    'nome_snapshot' => $entrada->nome_snapshot,
                    'preco_snapshot' => (float) $entrada->preco_snapshot,
                ]),
            ])),
            'grupos_complemento' => $this->whenLoaded('entradasComplementos', fn () => $this->formatGruposComplemento()),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function formatGruposComplemento(): Collection
    {
        return $this->entradasComplementos
            ->filter(fn (ComboEntrada $entrada) => $entrada->grupoComplemento !== null)
            ->groupBy(fn (ComboEntrada $entrada) => $entrada->grupoComplemento->getAttribute('id'))
            ->values()
            ->map(fn (Collection $entradas) => [
                'grupo_complemento_id' => $entradas->first()->grupoComplemento->getAttribute('id'),
                'nome' => $entradas->first()->grupoComplemento->getAttribute('nome'),
                'obrigatoriedade' => (bool) $entradas->first()->grupoComplemento->getAttribute('obrigatoriedade'),
                'qtd_minima' => (int) $entradas->first()->grupoComplemento->getAttribute('qtd_minima'),
                'qtd_maxima' => (int) $entradas->first()->grupoComplemento->getAttribute('qtd_maxima'),
                'complementos' => $entradas->map(fn (ComboEntrada $entrada) => [
                    'referencia_id' => $entrada->getAttribute('referencia_id'),
                    'nome_snapshot' => $entrada->getAttribute('nome_snapshot'),
                    'preco_snapshot' => (float) $entrada->getAttribute('preco_snapshot'),
                ])->values(),
            ])
            ->values();
    }
}
