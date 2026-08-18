<?php

namespace App\Services\Pagarme\Pedidos;

use App\Models\Integracao;
use App\Models\StatusFinanceiroPedidoApi;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApiExternaPedidos
{
    protected string $urlBase;

    public function __construct()
    {
        $this->urlBase = config('services.pagarme.urlBase');
    }

    public function criarPedido(
        int $empresa_id,
        string $uuid_financeiro,
        array $cliente,
        array $items,
        array $pagamento,
        array $entrega
    ): void {
        $chaveSecreta = Integracao::where('empresa_id', $empresa_id)->where('tipo', 'pagarme')->first()?->chavesecreta_pagarme;

        if (! $chaveSecreta) {
            Log::channel('financial')->warning('[PAGARME] Tentativa de criar pedido sem chave secreta configurada', [
                'empresa_id' => $empresa_id,
            ]);

            return;
        }

        $resposta = Http::withBasicAuth($chaveSecreta, '')
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post("{$this->urlBase}/orders", [
                'payments' => $pagamento,
                'closed' => true,
                'customer' => $cliente,
                'items' => $items,
                'shipping' => $entrega,
            ]);

        Log::channel('financial')->info('[PAGARME] Resposta criação de pedido', [
            'status_http' => $resposta->status(),
            'body' => $resposta->body(),
        ]);

        $respostaArray = json_decode($resposta->body(), true);

        foreach ($respostaArray['charges'] ?? [] as $charge) {
            if ($charge['payment_method'] === 'pix') {
                StatusFinanceiroPedidoApi::create([
                    'order_id' => $respostaArray['id'],
                    'financeiro_pedido_id' => $uuid_financeiro,
                    'status' => $charge['last_transaction']['status'],
                    'copia_cola_pix' => $charge['last_transaction']['qr_code'],
                    'url_qrcode_pix' => $charge['last_transaction']['qr_code_url'],
                ]);
            }
        }
    }

    public function fecharPedido(int $empresa_id, string $order_id, string $status): void
    {
        $chaveSecreta = Integracao::where('empresa_id', $empresa_id)->where('tipo', 'pagarme')->first()?->chavesecreta_pagarme;

        if (! $chaveSecreta) {
            return;
        }

        $resposta = Http::withBasicAuth($chaveSecreta, '')
            ->withHeaders(['Content-Type' => 'application/json'])
            ->patch("{$this->urlBase}/orders/{$order_id}/{$status}");

        if ($resposta->successful()) {
            StatusFinanceiroPedidoApi::where('order_id', $order_id)->update(['status' => $status]);
        }
    }
}
