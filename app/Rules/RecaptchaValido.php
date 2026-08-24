<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecaptchaValido implements ValidationRule
{
    public function __construct(private readonly string $acaoEsperada) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $secretKey = config('services.recaptcha.secret_key');

        // Sem secret key configurada (local/homolog antes da configuração), não bloqueia o
        // fluxo — só avisa nos logs. Em produção a variável precisa estar setada no .env.
        if (empty($secretKey)) {
            Log::warning('reCAPTCHA não configurado — validação ignorada.', ['acao' => $this->acaoEsperada]);

            return;
        }

        if (empty($value)) {
            $fail('Verificação de segurança ausente. Recarregue a página e tente novamente.');

            return;
        }

        $resposta = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $secretKey,
            'response' => $value,
            'remoteip' => request()->ip(),
        ])->json();

        $pontuacaoMinima = (float) config('services.recaptcha.min_score', 0.5);

        if (
            empty($resposta['success'])
            || ($resposta['action'] ?? null) !== $this->acaoEsperada
            || ($resposta['score'] ?? 0) < $pontuacaoMinima
        ) {
            Log::warning('Falha na verificação reCAPTCHA', [
                'acao_esperada' => $this->acaoEsperada,
                'resposta' => $resposta,
            ]);

            $fail('Não foi possível confirmar que você não é um robô. Tente novamente.');
        }
    }
}
