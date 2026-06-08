<?php

use App\Http\Controllers\Autenticacao\LoginEmpresaController;
use App\Http\Controllers\Empresa\ConfiguracaoController;
use App\Http\Controllers\Empresa\DesempenhoController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;


Route::get('/', [HomeController::class, 'index'])->name('aplicacao.home');

Route::prefix('autenticacao')->group(function () {
    Route::prefix('empresa')->group(function () {
        Route::get('login', [LoginEmpresaController::class, 'index'])->name('aplicacao.autenticacao.empresa.login');
        Route::post('login', [LoginEmpresaController::class, 'store'])->name('aplicacao.autenticacao.empresa.login.post');
    });
});

Route::group([], function () {
    Route::prefix('{cnpj}')->middleware('auth.empresa')->group(function () {
        Route::prefix('desempenho')->group(function () {
            Route::get('/', [DesempenhoController::class, 'index'])->name('aplicacao.empresa.desempenho');
            Route::post('buscaPedidosPorData', [DesempenhoController::class, 'buscaPedidosPorData'])->name('aplicacao.empresa.desempenho.buscaPedidosPorData');
        });
        Route::prefix('configuracoes')->group(function () {
            Route::patch('/', [ConfiguracaoController::class, 'configuraRecebimentoPedidoIfood'])->name('aplicacao.empresa.configuracoes');
        });
    });
});
