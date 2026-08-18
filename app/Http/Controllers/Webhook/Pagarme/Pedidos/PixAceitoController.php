<?php

namespace App\Http\Controllers\Webhook\Pagarme\Pedidos;

use App\Http\Controllers\Controller;
use App\Models\FinanceiroPedido;
use App\Models\Pedido;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

class PixAceitoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $data = $request->json()->all();

            Log::channel('financial')->info('[WEBHOOK PAGAR.ME RECEBIDO]', [
                'type' => $data['type'] ?? null,
                'order_id' => $data['data']['order']['id'] ?? null,
                'order_status' => $data['data']['order']['status'] ?? null,
                'ip' => $request->ip(),
            ]);

            $this->validateWebhookPayload($data);

            DB::transaction(function () use ($data) {
                $orderId = $data['data']['order']['id'];

                $statusApi = DB::table('status_financeiro_pedido_api')
                    ->where('order_id', $orderId)
                    ->lockForUpdate()
                    ->first();

                if (! $statusApi) {
                    throw new Exception("Registro de status financeiro não encontrado para order_id: {$orderId}");
                }

                if ($statusApi->status === 'paid') {
                    Log::channel('financial')->info('[WEBHOOK DUPLICADO] Pagamento já foi processado', [
                        'order_id' => $orderId,
                    ]);

                    return;
                }

                $financeiro = FinanceiroPedido::query()
                    ->whereUuid($statusApi->financeiro_pedido_id)
                    ->first();

                if (! $financeiro) {
                    throw new Exception("Financeiro não encontrado para UUID: {$statusApi->financeiro_pedido_id}");
                }

                $pedido = Pedido::query()->find($financeiro->pedido_id);

                if (! $pedido) {
                    throw new Exception("Pedido não encontrado para financeiro: {$financeiro->id}");
                }

                DB::table('status_financeiro_pedido_api')
                    ->where('id', $statusApi->id)
                    ->update(['status' => 'paid', 'updated_at' => now()]);

                $aceitarAutomaticamente = (bool) ($pedido->empresa
                    ->configuracoes()
                    ->where('configuracao', 'aceite_automatico')
                    ->value('valor') ?? false);

                $novoStatus = $aceitarAutomaticamente ? 'sendo preparado' : 'pendente';

                $pedido->update(['status' => $novoStatus]);

                Log::channel('financial')->info('[WEBHOOK PAGAR.ME PROCESSADO]', [
                    'order_id' => $orderId,
                    'pedido_id' => $pedido->id,
                    'status_novo' => $novoStatus,
                    'timestamp' => now(),
                ]);
            });

            return response()->json(['success' => true]);
        } catch (Exception $e) {
            Log::channel('financial')->error('[WEBHOOK PAGAR.ME ERRO]', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->json()->all(),
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    private function validateWebhookPayload(array $data): void
    {
        if (($data['type'] ?? null) !== 'charge.paid') {
            throw new InvalidArgumentException('Tipo de evento inválido: ' . ($data['type'] ?? 'not set'));
        }

        if (! isset($data['data']['order']['id'])) {
            throw new InvalidArgumentException('Estrutura de payload inválida: order.id não encontrado');
        }

        if (($data['data']['order']['status'] ?? null) !== 'paid') {
            throw new InvalidArgumentException('Status do pedido não é "paid"');
        }
    }
}
