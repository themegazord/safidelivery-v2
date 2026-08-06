<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoriaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'importacao_id' => $this->importacao_id,
            'cardapio_id' => $this->cardapio_id,
            'tipo' => $this->tipo,
            'nome' => $this->nome,
            'ordem' => $this->ordem,
            'dias_funcionamento' => $this->dias_funcionamento,
            'tamanhos' => $this->whenLoaded('tamanhos'),
            'massas' => $this->whenLoaded('massas'),
            'bordas' => $this->whenLoaded('bordas'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
