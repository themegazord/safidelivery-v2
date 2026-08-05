<?php

namespace App\Listeners;

use App\Jobs\PersistirLogEntry;
use Carbon\Carbon;
use Illuminate\Log\Events\MessageLogged;
use Illuminate\Support\Facades\Context;
use Monolog\Level;

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
            context: $event->context,
            datetime: $now,
            extra: Context::all(),
            level: $level->value,
            level_name: $level->getName(),
            cnpj: $cnpj);
    }
}
