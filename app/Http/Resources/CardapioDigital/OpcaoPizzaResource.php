<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\CategoriaMassa
 * @mixin \App\Models\CategoriaBorda
 */
class OpcaoPizzaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getAttribute('id'),
            'categoria_id' => $this->getAttribute('categoria_id'),
            'nome' => $this->getAttribute('nome'),
            'preco' => $this->getAttribute('preco'),
        ];
    }
}
