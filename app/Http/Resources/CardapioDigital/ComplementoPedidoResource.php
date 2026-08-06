<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComplementoPedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'grupo_id' => $this->grupo_id,
            'nome' => $this->nome,
            'descricao' => $this->descricao,
            'preco' => $this->preco,
            'status' => $this->status,
            'quantidade' => 0,
        ];
    }
}
