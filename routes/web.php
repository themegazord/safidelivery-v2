<?php

use App\Http\Controllers\Autenticacao\LoginClienteController;
use App\Http\Controllers\Autenticacao\LoginEmpresaController;
use App\Http\Controllers\Empresa\CardapioDigital\CardapioController;
use App\Http\Controllers\Empresa\CardapioDigital\FinalizarPedidoController;
use App\Http\Controllers\Empresa\Cardapios\CardapioController as EmpresaCardapioController;
use App\Http\Controllers\Empresa\Cardapios\Categorias\CategoriaController;
use App\Http\Controllers\Empresa\Cashback\CashbackConfigController;
use App\Http\Controllers\Empresa\ConfigEmpresa\ConfiguracoesController;
use App\Http\Controllers\Empresa\ConfigEmpresa\IntegracoesController;
use App\Http\Controllers\Empresa\ConfigEmpresa\LojaController;
use App\Http\Controllers\Empresa\ConfiguracaoController;
use App\Http\Controllers\Empresa\DesempenhoController;
use App\Http\Controllers\Empresa\Fidelidade\FidelidadeConfigController;
use App\Http\Controllers\Empresa\Promocoes\PromocaoController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;


Route::get('/', [HomeController::class, 'index'])->name('aplicacao.home');

Route::prefix('autenticacao')->group(function () {
    Route::prefix('empresa')->group(function () {
        Route::get('login', [LoginEmpresaController::class, 'index'])->name('aplicacao.autenticacao.empresa.login');
        Route::post('login', [LoginEmpresaController::class, 'store'])->name('aplicacao.autenticacao.empresa.login.post');
        Route::get('logout', function () {
            Auth::logout();
            redirect(route('aplicacao.autenticacao.empresa.login'));
        })->name('aplicacao.autenticacao.empresa.logout');
    });
    Route::prefix('cliente')->group(function () {
        Route::get('logout', function () {
            Auth::logout();
            return to_route('aplicacao.home');
        });
        Route::post('consultaDadosCliente', [LoginClienteController::class, 'consultaDadosCliente'])->name('aplicacao.autenticacao.cliente.consultaDadosCliente');
        Route::post('autenticaCliente', [LoginClienteController::class, 'autenticaCliente'])->name('aplicacao.autenticacao.cliente.autenticaCliente');
    });
});

Route::group([], function () {
    Route::prefix('{cnpj}')->middleware('auth.empresa')->group(function () {
        Route::prefix('desempenho')->group(function () {
            Route::get('/', [DesempenhoController::class, 'index'])->name('aplicacao.empresa.desempenho');
            Route::post('buscaPedidosPorData', [DesempenhoController::class, 'buscaPedidosPorData'])->name('aplicacao.empresa.desempenho.buscaPedidosPorData');
        });
        Route::prefix('configempresa')->group(function () {
            Route::get('loja', [LojaController::class, 'index'])->name('aplicacao.empresa.configempresa.loja');
            Route::post('loja', [LojaController::class, 'update'])->name('aplicacao.empresa.configempresa.loja.update');
            Route::prefix('integracoes')->group(function () {
                Route::get('/', [IntegracoesController::class, 'index'])->name('aplicacao.empresa.configempresa.integracoes');
                Route::get('safi/gera-company-token', [IntegracoesController::class, 'geraCompanyToken'])->name('aplicacao.empresa.configempresa.integracoes.safi.gera-company-token');
                Route::post('/', [IntegracoesController::class, 'update'])->name('aplicacao.empresa.configempresa.integracoes.update');
            });
            Route::prefix('configuracoes')->group(function () {
                Route::get('/', [ConfiguracoesController::class, 'index'])->name('aplicacao.empresa.configempresa.configuracoes');
                Route::post('/', [ConfiguracoesController::class, 'update'])->name('aplicacao.empresa.configempresa.configuracoes.update');
            });
        });
        Route::prefix('promocoes')->group(function () {
            Route::get('/', [PromocaoController::class, 'index'])->name('aplicacao.empresa.promocoes.index');
            Route::get('cadastro', [PromocaoController::class, 'create'])->name('aplicacao.empresa.promocoes.cadastro');
            Route::post('cadastro', [PromocaoController::class, 'store'])->name('aplicacao.empresa.promocoes.cadastro.store');
            Route::get('edicao/{cupom_id}', [PromocaoController::class, 'edit'])->name('aplicacao.empresa.promocoes.edicao');
            Route::post('edicao/{cupom_id}', [PromocaoController::class, 'update'])->name('aplicacao.empresa.promocoes.edicao.update');
            Route::delete('{cupom_id}', [PromocaoController::class, 'destroy'])->name('aplicacao.empresa.promocoes.destroy');
        });
        Route::prefix('configuracoes')->group(function () {
            Route::patch('/', [ConfiguracaoController::class, 'configuraRecebimentoPedidoIfood'])->name('aplicacao.empresa.configuracoes');
        });
        Route::prefix('cashback')->group(function () {
            Route::get('/', [CashbackConfigController::class, 'index'])->name('aplicacao.empresa.cashback.configuracao');
            Route::post('/', [CashbackConfigController::class, 'update'])->name('aplicacao.empresa.cashback.configuracao.update');
        });
        Route::prefix('fidelidade')->group(function () {
            Route::get('/', [FidelidadeConfigController::class, 'index'])->name('aplicacao.empresa.fidelidade.configuracao');
            Route::post('/', [FidelidadeConfigController::class, 'update'])->name('aplicacao.empresa.fidelidade.configuracao.update');
        });
        Route::prefix('cardapios')->group(function () {
            Route::get('/', [EmpresaCardapioController::class, 'index'])->name('aplicacao.empresa.cardapios.index');
            Route::post('/', [EmpresaCardapioController::class, 'store'])->name('aplicacao.empresa.cardapios.store');
            Route::post('/{cardapio_id}/clone', [EmpresaCardapioController::class, 'clone'])->name('aplicacao.empresa.cardapios.clone');
            Route::put('/{cardapio_id}', [EmpresaCardapioController::class, 'update'])->name('aplicacao.empresa.cardapios.update');
            Route::get('/{cardapio_id}', [EmpresaCardapioController::class, 'show'])->name('aplicacao.empresa.cardapios.show');
            Route::delete('/{cardapio_id}', [EmpresaCardapioController::class, 'destroy'])->name('aplicacao.empresa.cardapios.destroy');
            Route::get('/{cardapio_id}/exportar/{tipo}', [EmpresaCardapioController::class, 'export'])->name('aplicacao.empresa.cardapios.export');
            Route::post('/importarIfood', [EmpresaCardapioController::class, 'importIfood'])->name('aplicacao.empresa.cardapios.import_ifood');
            Route::post('/importarAnotaai', [EmpresaCardapioController::class, 'importAnotaai'])->name('aplicacao.empresa.cardapios.import_anotaai');
            Route::prefix('{cardapio_id}/categorias')->group(function () {
                Route::get('/', [CategoriaController::class, 'index'])->name('aplicacao.empresa.cardapios.categorias.index');
                Route::post('/', [CategoriaController::class, 'store'])->name('aplicacao.empresa.cardapios.categorias.store');
                Route::get('/{categoria_id}', [CategoriaController::class, 'show'])->name('aplicacao.empresa.cardapios.categorias.show');
                Route::put('/{categoria_id}', [CategoriaController::class, 'update'])->name('aplicacao.empresa.cardapios.categorias.update');
                Route::post('/{categoria_id}', [CategoriaController::class, 'clone'])->name('aplicacao.empresa.cardapios.categorias.clone');
                Route::post('/reordenar', [CategoriaController::class, 'reordenar'])->name('aplicacao.empresa.cardapios.categorias.reordenar');
                Route::get('/{categoria_id}/itens', [CategoriaController::class, 'itensPorCategoria'])->name('aplicacao.empresa.cardapios.categorias.itens.itens_por_categoria');
            });
        });
    });
});

Route::group([], function () {
    Route::prefix('loja/{interacao_id}/{tipo_funcionamento}')->group(function () {
        Route::get('/', [CardapioController::class, 'index'])->name('aplicacao.empresa.cardapio-digital');
        Route::post('/item-pedido', [CardapioController::class, 'itemPedido'])->name('aplicacao.empresa.cardapio-digital.item-pedido');
        Route::post('/item-pedido-pizza', [CardapioController::class, 'itemPizzaPedido'])->name('aplicacao.empresa.cardapio-digital.item-pedido-pizza');
        Route::post('/item-pedido-combo', [CardapioController::class, 'itemComboPedido'])->name('aplicacao.empresa.cardapio-digital.item-pedido-combo');
    });
    Route::prefix('finalizar-pedido')->group(function () {
        Route::get('/', [FinalizarPedidoController::class, 'index'])->name('aplicacao.empresa.finalizar-pedido');
        Route::post('/consulta-dados-rota', [FinalizarPedidoController::class, 'consultaDadosRota'])->name('aplicacao.empresa.finalizar-pedido.consulta-dados-rota');
        Route::patch('/altera-endereco-principal', [FinalizarPedidoController::class, 'alteraEnderecoPrincipal'])->name('aplicacao.empresa.finalizar-pedido.altera-endereco-principal');
        Route::post('/cadastra-novo-endereco', [FinalizarPedidoController::class, 'cadastraNovoEndereco'])->name('aplicacao.empresa.finalizar-pedido.cadastra-novo-endereco');
        Route::post('/valida-cupom-pedido', [FinalizarPedidoController::class, 'validaCupomPedido'])->name('aplicacao.empresa.finalizar-pedido.valida-cupom-pedido');
        Route::post('/itens-premio-fidelidade', [FinalizarPedidoController::class, 'itensPremioFidelidade'])->name('aplicacao.empresa.finalizar-pedido.itens-premio-fidelidade');
        Route::post('/detalhe-premio-item', [FinalizarPedidoController::class, 'detalhePremioItem'])->name('aplicacao.empresa.finalizar-pedido.detalhe-premio-item');
        Route::post('/detalhe-premio-pizza', [FinalizarPedidoController::class, 'detalhePremioPizza'])->name('aplicacao.empresa.finalizar-pedido.detalhe-premio-pizza');
        Route::post('/detalhe-premio-combo', [FinalizarPedidoController::class, 'detalhePremioCombo'])->name('aplicacao.empresa.finalizar-pedido.detalhe-premio-combo');
        Route::post('store', [FinalizarPedidoController::class, 'store'])->name('aplicacao.empresa.finalizar-pedido.store');
    });
});
