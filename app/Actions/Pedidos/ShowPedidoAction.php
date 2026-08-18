<?php

namespace App\Actions\Pedidos;

use App\Models\Empresa;
use App\Models\Pedido;

class ShowPedidoAction
{
    public function handle(Empresa $empresa, int $pedido_id): Pedido
    {
        return Pedido::withTrashed()
            ->where('empresa_id', $empresa->getAttribute('id'))
            ->with([
                'itens.complementos',
                'itens.sabores',
                'itens.borda',
                'itens.massa',
                'itens.comboItens.customizacoes',
                'cliente',
                'financeiro.pagamentos',
                'enderecoEntrega',
                'enderecoEntregaIfood',
                'dadosRetiradaPedido',
                'cupomUsadoNoPedido',
                'cuponsUsadoNoIfood',
                'cashback',
            ])
            ->findOrFail($pedido_id);
    }
}
