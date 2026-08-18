<?php

namespace App\Console\Commands;

use App\Models\JustificativaCancelamentoPedido;
use App\Models\Pedido;
use App\Services\Pagarme\Pedidos\ApiExternaPedidos;
use Illuminate\Console\Command;

class CancelaPedidosPixExpiradosCommand extends Command
{
    protected $signature = 'pedidos:cancela-pix-expirados {--minutos=5}';

    protected $description = 'Cancela pedidos que ficaram parados em "confirmar pix" além do tempo de expiração do QR Code (rede de segurança independente do front).';

    public function handle(ApiExternaPedidos $apiExternaPedidos): int
    {
        $minutos = (int) $this->option('minutos');

        $pedidosExpirados = Pedido::where('status', 'confirmar pix')
            ->where('created_at', '<=', now()->subMinutes($minutos))
            ->with('financeiro.status_financeiro_api')
            ->get();

        $cancelados = 0;

        foreach ($pedidosExpirados as $pedido) {
            JustificativaCancelamentoPedido::create([
                'pedido_id' => $pedido->id,
                'origem_cancelamento' => 'empresa',
                'motivo' => 'Prazo para o pagamento do pix finalizado',
            ]);

            $pedido->update(['status' => 'pix expirado']);

            $orderId = $pedido->financeiro?->status_financeiro_api?->order_id;

            if ($orderId) {
                $apiExternaPedidos->fecharPedido($pedido->empresa_id, $orderId, 'canceled');
            }

            $cancelados++;
        }

        $this->info("{$cancelados} pedido(s) com pix expirado cancelado(s).");

        return self::SUCCESS;
    }
}
