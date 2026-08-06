<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OpcaoPizzaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'categoria_id' => $this->categoria_id,
            'nome' => $this->nome,
            'preco' => $this->preco,
        ];
    }
}
