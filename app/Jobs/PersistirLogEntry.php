<?php

namespace App\Jobs;

use App\Models\LogEntry;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class PersistirLogEntry implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly string $message,
        public readonly array $context,
        public readonly string $datetime,
        public readonly array $extra,
        public readonly int $level,
        public readonly string $level_name,
        public readonly ?string $cnpj = null
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            LogEntry::query()->create([
                'message' => $this->message,
                'context' => $this->context,
                'extra' => $this->extra,
                'datetime' => $this->datetime,
                'level' => $this->level,
                'level_name' => $this->level_name,
                'cnpj' => $this->cnpj,
            ]);
        } catch (Throwable $t) {
        }
    }
}
