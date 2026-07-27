<?php

namespace App\Actions\FinalizarPedido;

use App\Models\CashbackCredito;

class CalculaSaldoCashbackAction
{
    public function handle(int $clienteId): float
    {
        return (float) CashbackCredito::where('cliente_id', $clienteId)
            ->where('data_vencimento', '>=', now())
            ->whereNotNull('liberado_em')
            ->whereNull('usado_em')
            ->where('saldo_restante', '>', 0)
            ->sum('saldo_restante');
    }
}
