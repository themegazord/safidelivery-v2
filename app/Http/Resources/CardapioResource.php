<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CardapioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'empresa_id' => $this->empresa_id,
            'tipo_importacao' => $this->tipo_importacao,
            'nome' => $this->nome,
            'descricao' => $this->descricao,
            'dias_funcionamento' => $this->dias_funcionamento,
            'tipo_funcionamento' => $this->tipo_funcionamento,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
