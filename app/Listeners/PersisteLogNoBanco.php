<?php

namespace App\Listeners;

use App\Jobs\PersistirLogEntry;
use Carbon\Carbon;
use Closure;
use Illuminate\Log\Events\MessageLogged;
use Illuminate\Support\Facades\Context;
use Monolog\Level;
use Throwable;

class PersisteLogNoBanco
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(MessageLogged $event): void
    {
        if (in_array($event->level, ['debug'])) return;
        $cnpj = Context::get('cnpj');
        $level = Level::fromName($event->level);
        $now = Carbon::now()->format('Y-m-d H:i:s');
        PersistirLogEntry::dispatch(
            message: $event->message,
            context: $this->sanitizarParaFila($event->context),
            datetime: $now,
            extra: $this->sanitizarParaFila(Context::all()),
            level: $level->value,
            level_name: $level->getName(),
            cnpj: $cnpj);
    }

    /**
     * Exceptions logadas em ['exception' => $e] podem carregar objetos de SDKs
     * (ex: AwsException segurando o handler stack do Guzzle) que têm Closures
     * em propriedades internas. Isso quebra silenciosamente o dispatch do job
     * de log na fila 'database', que precisa serializar o payload inteiro.
     * Troca Throwable/Closure por representações seguras antes de despachar.
     */
    private function sanitizarParaFila(mixed $valor): mixed
    {
        if ($valor instanceof Throwable) {
            return [
                'class' => get_class($valor),
                'message' => $valor->getMessage(),
                'file' => $valor->getFile(),
                'line' => $valor->getLine(),
                'trace' => $valor->getTraceAsString(),
                'previous' => $valor->getPrevious() ? $this->sanitizarParaFila($valor->getPrevious()) : null,
            ];
        }

        if ($valor instanceof Closure) {
            return '(closure)';
        }

        if (is_array($valor)) {
            return array_map(fn ($item) => $this->sanitizarParaFila($item), $valor);
        }

        return $valor;
    }
}
