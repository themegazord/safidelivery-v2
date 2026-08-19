<?php

namespace App\Http\Resources\Clientes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Cliente
 * @property float $valor_total_gasto
 * @property int $total_pedidos
 */
class TopCompradoresPorValorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getAttribute('id'),
            'nome' => $this->getAttribute('nome'),
            'telefone' => $this->getAttribute('telefone'),
            'valor_total_gasto' => (float) $this->getAttribute('valor_total_gasto'),
            'total_pedidos' => (int) $this->getAttribute('total_pedidos'),
        ];
    }
}
