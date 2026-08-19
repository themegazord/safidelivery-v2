<?php

namespace App\Http\Resources\CardapioDigital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ComboEntrada
 */
class ComboItemGrupoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'referencia_id' => $this->getAttribute('referencia_id'),
            'nome' => $this->getAttribute('nome_snapshot'),
            'preco' => (float) $this->getAttribute('preco_snapshot'),
            'quantidade' => 0,
        ];
    }
}
