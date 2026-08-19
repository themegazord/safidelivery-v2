<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Cardapio
 */
class CardapioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getAttribute('id'),
            'empresa_id' => $this->getAttribute('empresa_id'),
            'tipo_importacao' => $this->getAttribute('tipo_importacao'),
            'nome' => $this->getAttribute('nome'),
            'descricao' => $this->getAttribute('descricao'),
            'dias_funcionamento' => $this->getAttribute('dias_funcionamento'),
            'tipo_funcionamento' => $this->getAttribute('tipo_funcionamento'),
            'created_at' => $this->getAttribute('created_at'),
            'updated_at' => $this->getAttribute('updated_at'),
        ];
    }
}
