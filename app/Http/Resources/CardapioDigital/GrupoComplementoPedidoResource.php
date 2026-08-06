<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GrupoComplementoPedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item_id' => $this->item_id,
            'nome' => $this->nome,
            'obrigatoriedade' => $this->obrigatoriedade,
            'qtd_minima' => $this->qtd_minima,
            'qtd_maxima' => $this->qtd_maxima,
            'bloqueado' => false,
            'complementos' => ComplementoPedidoResource::collection($this->whenLoaded('complementos')),
        ];
    }
}
