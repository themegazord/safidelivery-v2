<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Complemento
 */
class ComplementoPedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getAttribute('id'),
            'grupo_id' => $this->getAttribute('grupo_id'),
            'nome' => $this->getAttribute('nome'),
            'descricao' => $this->getAttribute('descricao'),
            'preco' => $this->getAttribute('preco'),
            'status' => $this->getAttribute('status'),
            'quantidade' => 0,
        ];
    }
}
