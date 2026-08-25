<?php

use App\Jobs\Empresa\ConsultarPedidosIfoodJob;
use App\Models\Empresa;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('itens:limpar-imagens-temporarias')->hourly();
Schedule::command('pedidos:cancela-pix-expirados')->everyMinute();

Schedule::call(function () {
    try {
        Empresa::where('esta_recebendo_pedidos_ifood', true)
            ->whereNotNull('tokenIfood')
            ->pluck('id')
            ->each(function ($empresaId) {
                ConsultarPedidosIfoodJob::dispatch($empresaId);
            });
    } catch (\Throwable $e) {
        Log::error('Erro no agendamento de Consulta IFOOD: '.$e->getMessage(), [
            'trace' => $e->getTraceAsString(),
        ]);
    }
})->everyThirtySeconds();
