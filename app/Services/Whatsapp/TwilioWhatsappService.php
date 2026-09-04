<?php

namespace App\Services\Whatsapp;

use Exception;
use Illuminate\Support\Facades\Http;

class TwilioWhatsappService
{
    /**
     * @param  string  $statusPedido  Status interno do pedido (ex: "aceito", "sendo
     *                                 preparado") — usado pra escolher o Content Template
     *                                 aprovado correspondente, se houver um configurado.
     * @param  array{nome: string, pedido: string, empresa: string, status: string}  $variaveis
     */
    public function enviar(string $telefone, string $statusPedido, array $variaveis, ?string $statusCallbackUrl = null): array
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = config('services.twilio.whatsapp_from');

        if (! $sid || ! $token || ! $from) {
            throw new Exception('Credenciais Twilio não configuradas');
        }

        $numeroDestino = $this->normalizaTelefone($telefone);

        $payload = [
            'From' => "whatsapp:{$from}",
            'To' => "whatsapp:+{$numeroDestino}",
        ];

        $contentSid = config('services.twilio.whatsapp_content_sids')[$statusPedido] ?? null;

        if ($contentSid) {
            $payload['ContentSid'] = $contentSid;
            $payload['ContentVariables'] = json_encode([
                '1' => $variaveis['nome'],
                '2' => $variaveis['pedido'],
                '3' => $variaveis['empresa'],
            ]);
        } else {
            $payload['Body'] = $this->montaMensagemLivre($variaveis);
        }

        if ($statusCallbackUrl) {
            $payload['StatusCallback'] = $statusCallbackUrl;
        }

        $resposta = Http::asForm()
            ->withBasicAuth($sid, $token)
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", $payload);

        if (! $resposta->successful()) {
            throw new Exception('Falha ao enviar mensagem via Twilio: '.$resposta->body());
        }

        $dados = $resposta->json();

        return [
            'sid' => $dados['sid'] ?? null,
            'status' => $dados['status'] ?? null,
        ];
    }

    /**
     * @param  array{nome: string, pedido: string, empresa: string, status: string}  $variaveis
     */
    public function montaMensagemLivre(array $variaveis): string
    {
        return sprintf(
            'Olá %s! Seu pedido #%s na %s agora está: %s.',
            $variaveis['nome'] ?? 'cliente',
            $variaveis['pedido'] ?? '',
            $variaveis['empresa'] ?? '',
            $variaveis['status'] ?? '',
        );
    }

    private function normalizaTelefone(string $telefone): string
    {
        $digitos = preg_replace('/\D/', '', $telefone);

        // Celular BR sem código do país, com o nono dígito (DDD + 9XXXXXXXX,
        // 11 dígitos): WhatsApp/Twilio esperam o número sem esse dígito extra
        // (DDD + XXXXXXXX), mesmo esse sendo o número real do celular.
        if (strlen($digitos) === 11 && $digitos[2] === '9') {
            $digitos = substr($digitos, 0, 2).substr($digitos, 3);
        }

        if (strlen($digitos) === 10) {
            $digitos = '55'.$digitos;
        }

        return $digitos;
    }
}
