<?php

use App\Http\Controllers\Pedidos;
use App\Http\Controllers\Webhook\Pagarme\Pedidos\PixAceitoController;
use App\Http\Controllers\Webhook\Twilio\WhatsappStatusController;
use Illuminate\Support\Facades\Route;

Route::prefix('webhook/pagarme/pedidos')->group(function () {
    Route::post('pix_aceito', [PixAceitoController::class, 'index'])->name('webhook.pagarme.pix-aceito');
});

Route::prefix('webhook/twilio')->group(function () {
    Route::post('whatsapp-status', [WhatsappStatusController::class, 'index'])->name('webhook.twilio.whatsapp-status');
});

Route::prefix('v1')->middleware('throttle:60,1')->group(function () {
    Route::prefix('pedidos')->group(function () {
        Route::get('/{pedido_id}', [Pedidos::class, 'consultaPedidos'])->name('api.pedidos.consulta_pedido');
        Route::post('/', [Pedidos::class, 'entregue'])->name('api.pedidos.entregue');
        Route::post('diario', [Pedidos::class, 'diario'])->name('api.pedidos.diario');
    });
    Route::prefix('empresa')->group(function () {
        Route::prefix('cadastro')->group(function () {
            Route::post('/', [\App\Http\Controllers\Empresas::class, 'cadastroEmpresa'])->name('api.cadastro.empresa');
        });
        Route::prefix('formapgto')->group(function () {
            // Nome de rota diferente do endpoint de cadastro (que reaproveita 'api.cadastro.empresa',
            // igual ao legado): nomes duplicados fazem `route:cache` falhar. A URL, o método e o
            // controller continuam idênticos — só o nome interno da rota muda, nada usa route() aqui.
            Route::post('/', [\App\Http\Controllers\Empresas::class, 'upsertFormaPgto'])->name('api.cadastro.empresa.formapgto');
        });
    });
});
