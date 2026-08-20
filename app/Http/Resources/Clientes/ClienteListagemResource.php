<?php

namespace App\Http\Resources\Clientes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Cliente
 * @property string|null $primeira_compra
 * @property string|null $ultima_compra
 * @property float $valor_total_gasto
 * @property int $total_pedidos
 * @property float $ticket_medio
 * @property float $saldo_cashback
 * @property int $pontos_fidelidade
 * @property float $valor_acumulado_fidelidade
 * @property bool $recompensa_disponivel
 * @property bool|null $esta_ativo
 */
class ClienteListagemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getAttribute('id'),
            'nome' => $this->getAttribute('nome'),
            'telefone' => $this->getAttribute('telefone'),
            'primeira_compra' => $this->getAttribute('primeira_compra'),
            'ultima_compra' => $this->getAttribute('ultima_compra'),
            'valor_total_gasto' => (float) $this->getAttribute('valor_total_gasto'),
            'total_pedidos' => (int) $this->getAttribute('total_pedidos'),
            'ticket_medio' => (float) $this->getAttribute('ticket_medio'),
            'saldo_cashback' => (float) $this->getAttribute('saldo_cashback'),
            'pontos_fidelidade' => (int) $this->getAttribute('pontos_fidelidade'),
            'valor_acumulado_fidelidade' => (float) $this->getAttribute('valor_acumulado_fidelidade'),
            'recompensa_disponivel' => (bool) $this->getAttribute('recompensa_disponivel'),
            'esta_ativo' => $this->getAttribute('esta_ativo') === null ? null : (bool) $this->getAttribute('esta_ativo'),
        ];
    }
}
