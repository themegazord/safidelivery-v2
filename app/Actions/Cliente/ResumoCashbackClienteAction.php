<?php

namespace App\Actions\Cliente;

use App\Models\CashbackCredito;
use Carbon\Carbon;

class ResumoCashbackClienteAction
{
    public function handle(int $clienteId): array
    {
        $todos = CashbackCredito::where('cliente_id', $clienteId)->get();

        $agora = Carbon::now();

        $gerado = (float) $todos->sum('credito_gerado');
        $usado = (float) $todos->sum(fn ($c) => $c->credito_gerado - $c->saldo_restante);

        $disponiveis = $todos->filter(
            fn ($c) => $c->liberado_em !== null && $c->saldo_restante > 0 && $c->data_vencimento >= $agora
        );

        $pendentes = $todos->filter(
            fn ($c) => $c->liberado_em === null && $c->saldo_restante > 0 && $c->data_vencimento >= $agora
        );

        $vencidos = $todos->filter(
            fn ($c) => $c->saldo_restante > 0 && $c->data_vencimento < $agora
        );

        $proximosVencimentos = $disponiveis
            ->sortBy('data_vencimento')
            ->values()
            ->map(fn ($c) => [
                'pedido_id' => $c->pedido_id,
                'saldo_restante' => (float) $c->saldo_restante,
                'data_vencimento' => $c->data_vencimento,
            ]);

        return [
            'gerado' => $gerado,
            'usado' => $usado,
            'disponivel' => (float) $disponiveis->sum('saldo_restante'),
            'pendente' => (float) $pendentes->sum('saldo_restante'),
            'vencido' => (float) $vencidos->sum('saldo_restante'),
            'proximos_vencimentos' => $proximosVencimentos->all(),
        ];
    }
}
