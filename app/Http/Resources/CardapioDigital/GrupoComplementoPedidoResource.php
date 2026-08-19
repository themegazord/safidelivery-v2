<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\GrupoComplemento
 */
class GrupoComplementoPedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getAttribute('id'),
            'item_id' => $this->getAttribute('item_id'),
            'nome' => $this->getAttribute('nome'),
            'obrigatoriedade' => $this->getAttribute('obrigatoriedade'),
            'qtd_minima' => $this->getAttribute('qtd_minima'),
            'qtd_maxima' => $this->getAttribute('qtd_maxima'),
            'bloqueado' => false,
            'complementos' => ComplementoPedidoResource::collection($this->whenLoaded('complementos')),
        ];
    }
}
