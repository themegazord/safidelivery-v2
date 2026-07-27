<?php

namespace App\Observers;

use App\Models\Pedido;
use App\Services\Fidelidade\FidelidadeService;

class PedidoObserver
{
    /**
     * Handle the Pedido "updated" event.
     */
    public function updated(Pedido $pedido): void
    {
        if (! $pedido->wasChanged('status')) {
            return;
        }

        if (! in_array($pedido->getAttribute('status'), Pedido::STATUS_FINALIZADOS_SUCESSO, true)) {
            return;
        }

        $pedido->cashback()
            ->whereNull('liberado_em')
            ->update(['liberado_em' => now()]);

        app(FidelidadeService::class)->registrarPedidoConcluido($pedido);
    }
}
