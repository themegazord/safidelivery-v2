<?php

namespace App\Jobs\Empresa;

use App\Models\Configuracao;
use App\Models\Pedido;
use App\Models\WhatsappNotificacaoPedido;
use App\Services\Whatsapp\TwilioWhatsappService;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class EnviaNotificacaoWhatsappStatusPedidoJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $pedido_id) {}

    public function handle(TwilioWhatsappService $twilio): void
    {
        $pedido = Pedido::with(['cliente', 'empresa'])->find($this->pedido_id);

        if (! $pedido) {
            return;
        }

        $ativo = (bool) Configuracao::where('empresa_id', $pedido->empresa_id)
            ->where('configuracao', 'whatsapp_notificacao_status_pedido')
            ->value('valor');

        if (! $ativo) {
            return;
        }

        $telefone = $pedido->cliente?->telefone ?: $pedido->telefone;

        if (! $telefone) {
            return;
        }

        $variaveis = [
            'nome' => $pedido->cliente?->nome ?? $pedido->nome ?? 'cliente',
            'pedido' => (string) ($pedido->ifood_display_id ?? $pedido->id),
            'empresa' => $pedido->empresa->nome_fantasia,
            'status' => $pedido->defineStatusPedidoCliente(),
        ];

        $mensagem = $twilio->montaMensagemLivre($variaveis);

        try {
            $resultado = $twilio->enviar(
                $telefone,
                $pedido->status,
                $variaveis,
                route('webhook.twilio.whatsapp-status'),
            );

            // Custo só é gravado quando a Twilio confirma via webhook que a mensagem
            // foi de fato encaminhada (status "sent"/"delivered"/"read") — a resposta
            // síncrona da API só significa que a chamada foi aceita, não que chegou.
            WhatsappNotificacaoPedido::create([
                'empresa_id' => $pedido->empresa_id,
                'pedido_id' => $pedido->id,
                'cliente_id' => $pedido->cliente_id,
                'telefone_destino' => $telefone,
                'status_pedido' => $pedido->status,
                'mensagem' => $mensagem,
                'twilio_message_sid' => $resultado['sid'],
                'status_twilio' => $resultado['status'],
                'sucesso' => true,
                'enviado_em' => now(),
            ]);
        } catch (Exception $e) {
            Log::error('Falha ao enviar notificação WhatsApp de status de pedido', [
                'pedido_id' => $pedido->id,
                'empresa_id' => $pedido->empresa_id,
                'telefone_final' => substr($telefone, -4),
                'erro' => $e->getMessage(),
            ]);

            WhatsappNotificacaoPedido::create([
                'empresa_id' => $pedido->empresa_id,
                'pedido_id' => $pedido->id,
                'cliente_id' => $pedido->cliente_id,
                'telefone_destino' => $telefone,
                'status_pedido' => $pedido->status,
                'mensagem' => $mensagem,
                'sucesso' => false,
                'erro' => $e->getMessage(),
            ]);
        }
    }
}
