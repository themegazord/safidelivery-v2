<?php

namespace App\Http\Resources;

use App\Models\ComboEntrada;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/**
 * @mixin \App\Models\Combo
 */
class ComboResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getAttribute('id'),
            'external_id' => $this->getAttribute('external_id'),
            'categoria_id' => $this->getAttribute('categoria_id'),
            'nome' => $this->getAttribute('nome'),
            'descricao' => $this->getAttribute('descricao'),
            'imagem' => $this->getAttribute('imagem'),
            'classificacao' => $this->getAttribute('classificacao'),
            'dias_funcionamento' => $this->getAttribute('dias_funcionamento'),
            'tipo_preco' => $this->getAttribute('tipo_preco'),
            'meta' => $this->whenLoaded('meta', fn () => [
                'preco_combo' => $this->getAttribute('meta')->getAttribute('preco_combo'),
                'desconto_combo' => $this->getAttribute('meta')->getAttribute('desconto_combo'),
            ]),
            'grupos' => $this->whenLoaded('grupos', fn () => $this->getAttribute('grupos')->map(fn ($grupo) => [
                'id' => $grupo->getAttribute('id'),
                'nome' => $grupo->getAttribute('nome'),
                'ordem' => $grupo->getAttribute('ordem'),
                'configuracao' => [
                    'obrigatorio' => $grupo->getAttribute('configuracao')['obrigatorio'] ?? true,
                    'qtd_minima' => $grupo->getAttribute('configuracao')['qtd_minima'] ?? 1,
                    'qtd_maxima' => $grupo->getAttribute('configuracao')['qtd_maxima'] ?? $grupo->getAttribute('qtd_maxima'),
                ],
                'entradas' => $grupo->getAttribute('entradas')->map(fn ($entrada) => [
                    'referencia_id' => $entrada->getAttribute('referencia_id'),
                    'nome_snapshot' => $entrada->getAttribute('nome_snapshot'),
                    'preco_snapshot' => (float) $entrada->getAttribute('preco_snapshot'),
                ]),
            ])),
            'grupos_complemento' => $this->whenLoaded('entradasComplementos', fn () => $this->formatGruposComplemento()),
            'created_at' => $this->getAttribute('created_at'),
            'updated_at' => $this->getAttribute('updated_at'),
        ];
    }

    private function formatGruposComplemento(): Collection
    {
        return $this->getAttribute('entradasComplementos')
            ->filter(fn (ComboEntrada $entrada) => $entrada->getAttribute('grupoComplemento') !== null)
            ->groupBy(fn (ComboEntrada $entrada) => $entrada->getAttribute('grupoComplemento')->getAttribute('id'))
            ->values()
            ->map(fn (Collection $entradas) => [
                'grupo_complemento_id' => $entradas->first()->getAttribute('grupoComplemento')->getAttribute('id'),
                'nome' => $entradas->first()->getAttribute('grupoComplemento')->getAttribute('nome'),
                'obrigatoriedade' => (bool) $entradas->first()->getAttribute('grupoComplemento')->getAttribute('obrigatoriedade'),
                'qtd_minima' => (int) $entradas->first()->getAttribute('grupoComplemento')->getAttribute('qtd_minima'),
                'qtd_maxima' => (int) $entradas->first()->getAttribute('grupoComplemento')->getAttribute('qtd_maxima'),
                'complementos' => $entradas->map(fn (ComboEntrada $entrada) => [
                    'referencia_id' => $entrada->getAttribute('referencia_id'),
                    'nome_snapshot' => $entrada->getAttribute('nome_snapshot'),
                    'preco_snapshot' => (float) $entrada->getAttribute('preco_snapshot'),
                ])->values(),
            ])
            ->values();
    }
}
