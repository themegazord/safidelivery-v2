<?php

namespace App\Actions\Pedidos;

use App\Models\Empresa;
use App\Models\PedidoIntegracaoIfood;

class IndexNotificacoesAction
{
    public function handle(Empresa $empresa): array
    {
        $hoje = now()->startOfDay();
        $amanha = now()->endOfDay();

        $notificacoes = $empresa->notificacoes()
            ->whereBetween('created_at', [$hoje, $amanha])
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        $hsdNotificacoes = $notificacoes->filter(fn ($n) => ($n->data['code'] ?? null) === 'HSD');

        $disputasPendentes = collect();
        $settlements = collect();

        if ($hsdNotificacoes->isNotEmpty()) {
            $pedidoIfoodIds = $hsdNotificacoes->map(fn ($n) => $n->pedido_ifood_id)->filter()->values();

            $settledRegistros = PedidoIntegracaoIfood::query()
                ->whereIn('orderId', $pedidoIfoodIds)
                ->where('code', 'HSS')
                ->orderByDesc('created_ifood_at')
                ->get();

            $settledOrderIds = $settledRegistros->pluck('orderId')->all();

            $disputasPendentes = $hsdNotificacoes
                ->filter(fn ($n) => ! in_array($n->pedido_ifood_id, $settledOrderIds))
                ->pluck('id')
                ->values();

            $settlements = $settledRegistros
                ->unique('orderId')
                ->mapWithKeys(fn ($registro) => [$registro->orderId => $registro->metadata['status'] ?? null]);
        }

        return [
            'notificacoes' => $notificacoes,
            'disputas_pendentes' => $disputasPendentes,
            'settlements' => $settlements,
        ];
    }
}
