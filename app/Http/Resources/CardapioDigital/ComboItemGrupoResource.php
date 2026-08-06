<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComboItemGrupoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'referencia_id' => $this->referencia_id,
            'nome' => $this->nome_snapshot,
            'preco' => (float) $this->preco_snapshot,
            'quantidade' => 0,
        ];
    }
}
