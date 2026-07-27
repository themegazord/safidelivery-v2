<?php

namespace App\Actions\FinalizarPedido;

use App\Models\CashbackCredito;

class ConsomeCashbackAction
{
    public function handle(int $clienteId, float $valorAConsumir): void
    {
        $restante = $valorAConsumir;

        $creditos = CashbackCredito::where('cliente_id', $clienteId)
            ->where('data_vencimento', '>=', now())
            ->whereNotNull('liberado_em')
            ->whereNull('usado_em')
            ->where('saldo_restante', '>', 0)
            ->orderBy('data_vencimento')
            ->lockForUpdate()
            ->get();

        foreach ($creditos as $credito) {
            if ($restante <= 0) {
                break;
            }

            $consumir = min($credito->getAttribute('saldo_restante'), $restante);
            $novoSaldo = $credito->getAttribute('saldo_restante') - $consumir;

            $credito->update([
                'saldo_restante' => $novoSaldo,
                'usado_em' => $novoSaldo <= 0 ? now() : null,
            ]);

            $restante -= $consumir;
        }
    }
}
