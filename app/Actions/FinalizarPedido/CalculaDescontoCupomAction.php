<?php

namespace App\Actions\FinalizarPedido;

class CalculaDescontoCupomAction
{
    public function handle(object $cupom, float $subtotal, ?float $frete): float
    {
        $baseCalculo = $cupom->onde_afetara === 'frete' ? floatval($frete ?? 0) : $subtotal;

        if ($baseCalculo <= 0) {
            return 0.0;
        }

        if ($cupom->tipo_cupom === 'porcentagem') {
            $desconto = $baseCalculo * (floatval($cupom->valor_desconto) / 100);

            if (floatval($cupom->valor_maximo_desconto) > 0) {
                $desconto = min($desconto, floatval($cupom->valor_maximo_desconto));
            }
        } else {
            $desconto = floatval($cupom->valor_desconto);
        }

        return round(min($desconto, $baseCalculo), 2);
    }
}
