<?php

namespace App\Http\Controllers\Webhook\Twilio;

use App\Http\Controllers\Controller;
use App\Models\WhatsappNotificacaoPedido;
use App\Models\WhatsappNotificacaoPreco;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsappStatusController extends Controller
{
    private const STATUS_FALHA = ['failed', 'undelivered'];

    private const STATUS_CONFIRMADOS = ['sent', 'delivered', 'read'];

    public function index(Request $request): JsonResponse
    {
        if (! $this->assinaturaValida($request)) {
            Log::warning('Webhook Twilio WhatsApp: assinatura inválida', ['ip' => $request->ip()]);

            return response()->json(['error' => 'Assinatura inválida'], 403);
        }

        $messageSid = $request->input('MessageSid');
        $status = $request->input('MessageStatus');
        $codigoErro = $request->input('ErrorCode');

        $registro = WhatsappNotificacaoPedido::where('twilio_message_sid', $messageSid)->first();

        if (! $registro) {
            return response()->json(['ok' => true]);
        }

        $registro->status_twilio = $status;
        $registro->erro_codigo = $codigoErro;

        if (in_array($status, self::STATUS_FALHA, true)) {
            $registro->sucesso = false;
            $registro->preco_usd = null;
            $registro->erro = "Falha reportada pela Twilio (código {$codigoErro})";
        } elseif (in_array($status, self::STATUS_CONFIRMADOS, true) && $registro->preco_usd === null) {
            $preco = WhatsappNotificacaoPreco::vigenteEm($registro->enviado_em ?? now());
            $registro->preco_usd = $preco?->preco_usd;
        }

        $registro->save();

        return response()->json(['ok' => true]);
    }

    private function assinaturaValida(Request $request): bool
    {
        $token = config('services.twilio.token');
        $assinaturaRecebida = $request->header('X-Twilio-Signature');

        if (! $token || ! $assinaturaRecebida) {
            return false;
        }

        $dados = $request->post();
        ksort($dados);

        $string = $request->fullUrl();
        foreach ($dados as $chave => $valor) {
            $string .= $chave.$valor;
        }

        $assinaturaEsperada = base64_encode(hash_hmac('sha1', $string, $token, true));

        return hash_equals($assinaturaEsperada, $assinaturaRecebida);
    }
}
