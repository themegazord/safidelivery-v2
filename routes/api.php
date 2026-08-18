<?php

use App\Http\Controllers\Webhook\Pagarme\Pedidos\PixAceitoController;
use Illuminate\Support\Facades\Route;

Route::prefix('webhook/pagarme/pedidos')->group(function () {
    Route::post('pix_aceito', [PixAceitoController::class, 'index'])->name('webhook.pagarme.pix-aceito');
});
