<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Categoria
 */
class CategoriaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getAttribute('id'),
            'importacao_id' => $this->getAttribute('importacao_id'),
            'cardapio_id' => $this->getAttribute('cardapio_id'),
            'tipo' => $this->getAttribute('tipo'),
            'nome' => $this->getAttribute('nome'),
            'ordem' => $this->getAttribute('ordem'),
            'dias_funcionamento' => $this->getAttribute('dias_funcionamento'),
            'tamanhos' => $this->whenLoaded('tamanhos'),
            'massas' => $this->whenLoaded('massas'),
            'bordas' => $this->whenLoaded('bordas'),
            'created_at' => $this->getAttribute('created_at'),
            'updated_at' => $this->getAttribute('updated_at'),
        ];
    }
}
