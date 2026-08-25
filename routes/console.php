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
        // Em ambientes que compartilham o banco com outra instância rodando a mesma
        // integração (ex: dev/homolog apontando pro banco de produção), defina
        // IFOOD_POLLING_EMPRESA_IDS=1,2,3 no .env pra restringir o polling deste
        // ambiente só a essas empresas e não competir pelos eventos das demais.
        $empresasPermitidas = array_filter(explode(',', (string) env('IFOOD_POLLING_EMPRESA_IDS', '')));

        Empresa::where('esta_recebendo_pedidos_ifood', true)
            ->whereNotNull('tokenIfood')
            ->when($empresasPermitidas, fn ($q) => $q->whereIn('id', $empresasPermitidas))
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
