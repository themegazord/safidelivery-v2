<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ComboGrupo
 */
class ComboGrupoPedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getAttribute('id'),
            'nome' => $this->getAttribute('nome'),
            'obrigatorio' => (bool) ($this->getAttribute('configuracao')['obrigatorio'] ?? true),
            'qtd_minima' => (int) ($this->getAttribute('configuracao')['qtd_minima'] ?? 1),
            'qtd_maxima' => (int) ($this->getAttribute('configuracao')['qtd_maxima'] ?? $this->getAttribute('qtd_maxima')),
            'quantidade_selecionada' => 0,
            'bloqueado' => false,
            'itens' => ComboItemGrupoResource::collection($this->whenLoaded('entradas')),
        ];
    }
}
