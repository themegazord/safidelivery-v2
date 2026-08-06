<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComboGrupoPedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'obrigatorio' => (bool) ($this->configuracao['obrigatorio'] ?? true),
            'qtd_minima' => (int) ($this->configuracao['qtd_minima'] ?? 1),
            'qtd_maxima' => (int) ($this->configuracao['qtd_maxima'] ?? $this->qtd_maxima),
            'quantidade_selecionada' => 0,
            'bloqueado' => false,
            'itens' => ComboItemGrupoResource::collection($this->whenLoaded('entradas')),
        ];
    }
}
