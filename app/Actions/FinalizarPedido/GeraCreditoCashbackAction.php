<?php

namespace App\Actions\FinalizarPedido;

use App\Models\CashbackConfig;
use App\Models\CashbackCredito;
use App\Models\Pedido;

class GeraCreditoCashbackAction
{
    public function handle(
        int $empresaId,
        int $clienteId,
        Pedido $pedido,
        string $tipoFuncionamento,
        float $subtotalItens,
        float $cashbackUtilizado,
    ): float {
        if ($tipoFuncionamento === 'mesa') {
            return 0.0;
        }

        $config = CashbackConfig::where('empresa_id', $empresaId)->first();

        if (! $config?->getAttribute('status')) {
            return 0.0;
        }

        if (! in_array($tipoFuncionamento, $config->tipos_funcionamento_efetivos, true)) {
            return 0.0;
        }

        if ($config->cashback_tipo?->value === 'porcentagem') {
            $baseCalculo = $config->getAttribute('base_calculo_porcentagem') === 'subtotal_liquido'
                ? max(0, $subtotalItens - $cashbackUtilizado)
                : $subtotalItens;

            $cashbackGerado = $baseCalculo * (floatval($config->getAttribute('cashback_porcentagem')) / 100);
        } else {
            $cashbackGerado = floatval($config->getAttribute('cashback_fixo'));
        }

        if ($cashbackGerado <= 0) {
            return 0.0;
        }

        $cashbackGerado = round($cashbackGerado, 2);

        CashbackCredito::create([
            'empresa_id' => $empresaId,
            'cliente_id' => $clienteId,
            'pedido_id' => $pedido->getAttribute('id'),
            'credito_gerado' => $cashbackGerado,
            'saldo_restante' => $cashbackGerado,
            'data_gerado' => $pedido->getAttribute('created_at'),
            'data_vencimento' => now()->addDays((int) $config->getAttribute('dias_validade')),
        ]);

        return $cashbackGerado;
    }
}
