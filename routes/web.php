<?php

use App\Http\Controllers\Autenticacao\EsqueciSenhaController;
use App\Http\Controllers\Autenticacao\LoginClienteController;
use App\Http\Controllers\Autenticacao\LoginEmpresaController;
use App\Http\Controllers\Cliente\ChatController as ClienteChatController;
use App\Http\Controllers\Cliente\MeusPedidosController;
use App\Http\Controllers\Empresa\AjudaBug\BugReportController;
use App\Http\Controllers\Empresa\CardapioDigital\CardapioController;
use App\Http\Controllers\Empresa\Chat\ChatController as EmpresaChatController;
use App\Http\Controllers\Empresa\CardapioDigital\FinalizarPedidoController;
use App\Http\Controllers\Empresa\Cardapios\CardapioController as EmpresaCardapioController;
use App\Http\Controllers\Empresa\Cardapios\Categorias\CategoriaController;
use App\Http\Controllers\Empresa\Cardapios\Categorias\Itens\ComboController;
use App\Http\Controllers\Empresa\Cardapios\Categorias\Itens\GrupoComplemento\GrupoComplementoController;
use App\Http\Controllers\Empresa\Cardapios\Categorias\Itens\ItemController;
use App\Http\Controllers\Empresa\Cardapios\ComplementoController;
use App\Http\Controllers\Empresa\Cardapios\ProdutoController;
use App\Http\Controllers\Empresa\Cashback\CashbackConfigController;
use App\Http\Controllers\Empresa\ConfigEmpresa\ConfiguracoesController;
use App\Http\Controllers\Empresa\ConfigEntrega\ConfigEntregaController;
use App\Http\Controllers\Empresa\Horarios\HorariosController;
use App\Http\Controllers\Empresa\ConfigEmpresa\IntegracoesController;
use App\Http\Controllers\Empresa\ConfigEmpresa\LojaController;
use App\Http\Controllers\Empresa\ConfiguracaoController;
use App\Http\Controllers\Empresa\DesempenhoController;
use App\Http\Controllers\Empresa\Fidelidade\FidelidadeConfigController;
use App\Http\Controllers\Empresa\FormaPagamento\FormaPagamentoController;
use App\Http\Controllers\Empresa\Pedidos\ClienteHistoricoController;
use App\Http\Controllers\Empresa\Pedidos\NotificacaoController;
use App\Http\Controllers\Empresa\Pedidos\PedidosController;
use App\Http\Controllers\Empresa\Pedidos\TodosPedidosController;
use App\Http\Controllers\Empresa\Promocoes\PromocaoController;
use App\Http\Controllers\Empresa\QrCodeMesa\QrCodeMesaController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PedidoImpressaoController;
use App\Http\Controllers\Empresa\Clientes\ClienteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('aplicacao.home');

Route::prefix('login')->group(function () {
    Route::get('empresa', [LoginEmpresaController::class, 'index'])->name('aplicacao.autenticacao.empresa.login');
    Route::post('empresa', [LoginEmpresaController::class, 'store'])->name('aplicacao.autenticacao.empresa.login.post')->middleware('throttle:6,1');
});

Route::prefix('autenticacao')->group(function () {
    Route::prefix('empresa')->group(function () {
        Route::get('logout', function (Request $request) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return to_route('aplicacao.autenticacao.empresa.login');
        })->name('aplicacao.autenticacao.empresa.logout');

        Route::get('esqueci-senha', [EsqueciSenhaController::class, 'index'])->name('aplicacao.autenticacao.empresa.esqueci-senha');
        Route::post('esqueci-senha', [EsqueciSenhaController::class, 'envia'])->name('aplicacao.autenticacao.empresa.esqueci-senha.post')->middleware('throttle:3,1');
        Route::get('redefinir-senha/{token}', [EsqueciSenhaController::class, 'formularioRedefinicao'])->name('aplicacao.autenticacao.empresa.redefinir-senha');
        Route::post('redefinir-senha', [EsqueciSenhaController::class, 'redefine'])->name('aplicacao.autenticacao.empresa.redefinir-senha.post')->middleware('throttle:6,1');
    });
    Route::prefix('cliente')->group(function () {
        Route::get('logout', function (Request $request) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return to_route('aplicacao.home');
        })->name('aplicacao.autenticacao.cliente.logout');
        Route::post('consultaDadosCliente', [LoginClienteController::class, 'consultaDadosCliente'])->name('aplicacao.autenticacao.cliente.consultaDadosCliente')->middleware('throttle:15,1');
        Route::post('autenticaCliente', [LoginClienteController::class, 'autenticaCliente'])->name('aplicacao.autenticacao.cliente.autenticaCliente')->middleware('throttle:15,1');
    });
});

Route::group([], function () {
    Route::prefix('{cnpj}')->middleware('auth.empresa')->group(function () {
        Route::prefix('desempenho')->group(function () {
            Route::get('/', [DesempenhoController::class, 'index'])->name('aplicacao.empresa.desempenho');
            Route::post('buscaPedidosPorData', [DesempenhoController::class, 'buscaPedidosPorData'])->name('aplicacao.empresa.desempenho.buscaPedidosPorData');
        });
        Route::prefix('pedidos')->group(function () {
            Route::get('/', [PedidosController::class, 'index'])->name('aplicacao.empresa.pedidos.index');
            Route::get('/todos-pedidos', [TodosPedidosController::class, 'index'])->name('aplicacao.empresa.pedidos.todos-pedidos');
            Route::patch('/configuracao', [PedidosController::class, 'atualizaConfiguracao'])->name('aplicacao.empresa.pedidos.configuracao');
            Route::get('/verifica-novos', [PedidosController::class, 'verificaNovos'])->name('aplicacao.empresa.pedidos.verifica-novos');
            Route::get('/cliente/{cliente_id}/historico', [ClienteHistoricoController::class, 'show'])->name('aplicacao.empresa.pedidos.cliente.historico');
            Route::get('/notificacoes', [NotificacaoController::class, 'index'])->name('aplicacao.empresa.pedidos.notificacoes.index');
            Route::post('/notificacoes/marcar-lidas', [NotificacaoController::class, 'marcarLidas'])->name('aplicacao.empresa.pedidos.notificacoes.marcar-lidas');
            Route::post('/notificacoes/{notificacao_id}/responder-negociacao', [NotificacaoController::class, 'responderNegociacao'])->name('aplicacao.empresa.pedidos.notificacoes.responder-negociacao');
            Route::get('/notificacoes/{notificacao_id}/evidencias', [NotificacaoController::class, 'evidencias'])->name('aplicacao.empresa.pedidos.notificacoes.evidencias');
            Route::get('/{pedido_id}', [PedidosController::class, 'show'])->name('aplicacao.empresa.pedidos.show');
            Route::get('/{pedido_id}/url-impressao', [PedidosController::class, 'urlImpressao'])->name('aplicacao.empresa.pedidos.url-impressao');
            Route::patch('/{pedido_id}/status', [PedidosController::class, 'status'])->name('aplicacao.empresa.pedidos.status');
            Route::get('/{pedido_id}/motivos-cancelamento-ifood', [PedidosController::class, 'motivosCancelamentoIfood'])->name('aplicacao.empresa.pedidos.motivos-cancelamento-ifood');
            Route::post('/{pedido_id}/cancelar', [PedidosController::class, 'cancelar'])->name('aplicacao.empresa.pedidos.cancelar');
            Route::post('/{pedido_id}/confirmar-entrega', [PedidosController::class, 'confirmarEntrega'])->name('aplicacao.empresa.pedidos.confirmar-entrega');
            Route::post('/{pedido_id}/todos-pedidos-cancelar', [TodosPedidosController::class, 'cancelar'])->name('aplicacao.empresa.pedidos.todos-pedidos.cancelar');
            Route::post('/{pedido_id}/todos-pedidos-confirmar-entrega', [TodosPedidosController::class, 'confirmarEntrega'])->name('aplicacao.empresa.pedidos.todos-pedidos.confirmar-entrega');
        });
        Route::prefix('clientes')->group(function () {
            Route::get('/', [ClienteController::class, 'index'])->name('aplicacao.empresa.clientes.index');
            Route::get('/consultaDadosPainelCashback', [ClienteController::class, 'consultaDadosPainelCashback'])->name('aplicacao.empresa.clientes.consultaDadosPainelCashback');
            Route::get('/topCompradoresPorValor', [ClienteController::class, 'topCompradoresPorValor'])->name('aplicacao.empresa.clientes.topCompradoresPorValor');
            Route::get('/topCompradoresPorQuantidade', [ClienteController::class, 'topCompradoresPorQuantidade'])->name('aplicacao.empresa.clientes.topCompradoresPorQuantidade');
            Route::get('/{cliente_id}/detalhe', [ClienteController::class, 'detalhe'])->name('aplicacao.empresa.clientes.detalhe');
        });
        Route::prefix('configentrega')->group(function () {
            Route::get('/', [ConfigEntregaController::class, 'index'])->name('aplicacao.empresa.configentrega.index');
            Route::post('/geral', [ConfigEntregaController::class, 'atualizaConfiguracoesGerais'])->name('aplicacao.empresa.configentrega.geral');
            Route::post('/taxas', [ConfigEntregaController::class, 'salvarTaxas'])->name('aplicacao.empresa.configentrega.taxas');
        });
        Route::prefix('chat')->group(function () {
            Route::get('/conversas', [EmpresaChatController::class, 'conversas'])->name('aplicacao.empresa.chat.conversas');
            Route::get('/{pedido_id}/mensagens', [EmpresaChatController::class, 'mensagens'])->name('aplicacao.empresa.chat.mensagens');
            Route::post('/{pedido_id}/mensagens', [EmpresaChatController::class, 'enviarMensagem'])->name('aplicacao.empresa.chat.mensagens.store');
        });
        Route::prefix('horarios')->group(function () {
            Route::get('/', [HorariosController::class, 'index'])->name('aplicacao.empresa.horarios.index');
            Route::post('/funcionamento', [HorariosController::class, 'atualizaFuncionamento'])->name('aplicacao.empresa.horarios.funcionamento');
            Route::post('/grade/{tipo_funcionamento}', [HorariosController::class, 'salvarGrade'])->name('aplicacao.empresa.horarios.grade');
            Route::post('/indisponibilidades', [HorariosController::class, 'cadastraIndisponibilidade'])->name('aplicacao.empresa.horarios.indisponibilidades.store');
            Route::delete('/indisponibilidades/{indisponibilidade_id}', [HorariosController::class, 'removeIndisponibilidade'])->name('aplicacao.empresa.horarios.indisponibilidades.destroy');
        });
        Route::prefix('formapagamento')->group(function () {
            Route::get('/', [FormaPagamentoController::class, 'index'])->name('aplicacao.empresa.formapagamento.index');
            Route::post('/', [FormaPagamentoController::class, 'store'])->name('aplicacao.empresa.formapagamento.store');
            Route::put('/{forma_pagamento_id}', [FormaPagamentoController::class, 'update'])->name('aplicacao.empresa.formapagamento.update');
            Route::delete('/{forma_pagamento_id}', [FormaPagamentoController::class, 'destroy'])->name('aplicacao.empresa.formapagamento.destroy');
        });
        Route::prefix('qrcodemesa')->group(function () {
            Route::get('/', [QrCodeMesaController::class, 'index'])->name('aplicacao.empresa.qrcodemesa.index');
            Route::post('/', [QrCodeMesaController::class, 'store'])->name('aplicacao.empresa.qrcodemesa.store');
            Route::put('/{mesa_id}', [QrCodeMesaController::class, 'update'])->name('aplicacao.empresa.qrcodemesa.update');
            Route::delete('/{mesa_id}', [QrCodeMesaController::class, 'destroy'])->name('aplicacao.empresa.qrcodemesa.destroy');
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
            Route::get('/{cardapio_id}/produtos', [ProdutoController::class, 'index'])->name('aplicacao.empresa.cardapios.produtos.index');
            Route::get('/{cardapio_id}/complementos', [ComplementoController::class, 'index'])->name('aplicacao.empresa.cardapios.complementos.index');
            Route::prefix('{cardapio_id}/categorias')->group(function () {
                Route::get('/', [CategoriaController::class, 'index'])->name('aplicacao.empresa.cardapios.categorias.index');
                Route::post('/', [CategoriaController::class, 'store'])->name('aplicacao.empresa.cardapios.categorias.store');
                Route::get('/{categoria_id}', [CategoriaController::class, 'show'])->name('aplicacao.empresa.cardapios.categorias.show');
                Route::put('/{categoria_id}', [CategoriaController::class, 'update'])->name('aplicacao.empresa.cardapios.categorias.update');
                Route::post('/{categoria_id}', [CategoriaController::class, 'clone'])->name('aplicacao.empresa.cardapios.categorias.clone');
                Route::delete('/{categoria_id}', [CategoriaController::class, 'destroy'])->name('aplicacao.empresa.cardapios.categorias.delete');
                Route::patch('/{categoria_id}', [CategoriaController::class, 'status'])->name('aplicacao.empresa.cardapios.categorias.status');
                Route::post('/reordenar', [CategoriaController::class, 'reordenar'])->name('aplicacao.empresa.cardapios.categorias.reordenar');
                Route::get('/{categoria_id}/itens', [CategoriaController::class, 'itensPorCategoria'])->name('aplicacao.empresa.cardapios.categorias.itens.itens_por_categoria');
                Route::prefix('{categoria_id}/itens')->group(function () {
                    Route::post('/', [ItemController::class, 'store'])->name('aplicacao.empresa.cardapios.categorias.item.store');
                    Route::post('storeImage', [ItemController::class, 'storeImage'])->name('aplicacao.empresa.cardapios.categorias.item.store-imagem');
                    Route::delete('destroyImage', [ItemController::class, 'destroyImage'])->name('aplicacao.empresa.cardapios.categorias.item.destroy-imagem');
                    Route::get('/{item_id}', [ItemController::class, 'show'])->name('aplicacao.empresa.cardapios.categorias.item.show');
                    Route::put('/{item_id}', [ItemController::class, 'update'])->name('aplicacao.empresa.cardapios.categorias.item.update');
                    Route::post('/{item_id}', [ItemController::class, 'clone'])->name('aplicacao.empresa.cardapios.categorias.item.clone');
                    Route::patch('/{item_id}/status', [ItemController::class, 'status'])->name('aplicacao.empresa.cardapios.categorias.item.status');
                    Route::patch('/{item_id}/codpdv', [ItemController::class, 'updateCodPdv'])->name('aplicacao.empresa.cardapios.categorias.item.updateCodPdv');
                    Route::patch('/{item_id}/preco', [ItemController::class, 'updatePreco'])->name('aplicacao.empresa.cardapios.categorias.item.updatePreco');
                    Route::patch('/{item_id}/imagem', [ItemController::class, 'updateImagem'])->name('aplicacao.empresa.cardapios.categorias.item.updateImagem');
                    Route::delete('/{item_id}', [ItemController::class, 'destroy'])->name('aplicacao.empresa.cardapios.categorias.item.destroy');
                    Route::prefix('{item_id}/grupo_complementos')->group(function () {
                        Route::post('/', [GrupoComplementoController::class, 'store'])->name('aplicacao.empresa.cardapios.categorias.item.storeGrupoComplemento');
                        Route::post('copiaGrupoComplementos', [GrupoComplementoController::class, 'copiaGrupoComplementos'])->name('aplicacao.empresa.cardapios.categorias.item.copiaGrupoComplementos');
                        Route::post('copiaGruposComplementoSelecionados', [GrupoComplementoController::class, 'copiaGruposComplementoSelecionados'])->name('aplicacao.empresa.cardapios.categorias.item.copiaGruposComplementoSelecionados');
                        Route::get('buscaComplementosParaCopia', [GrupoComplementoController::class, 'buscaComplementosParaCopia'])->name('aplicacao.empresa.cardapios.categorias.item.buscaComplementosParaCopia');
                        Route::get('buscaGruposComplementoParaCopia', [GrupoComplementoController::class, 'buscaGruposComplementoParaCopia'])->name('aplicacao.empresa.cardapios.categorias.item.buscaGruposComplementoParaCopia');
                        Route::put('/{grupo_id}', [GrupoComplementoController::class, 'update'])->name('aplicacao.empresa.cardapios.categorias.item.updateGrupoComplemento');
                        Route::delete('/{grupo_id}', [GrupoComplementoController::class, 'destroy'])->name('aplicacao.empresa.cardapios.categorias.item.destroyGrupoComplemento');
                        Route::patch('/{grupo_id}/status', [GrupoComplementoController::class, 'status'])->name('aplicacao.empresa.cardapios.categorias.item.statusGrupoComplemento');
                        Route::put('/{grupo_id}/complementos/{complemento_id}', [GrupoComplementoController::class, 'updateComplemento'])->name('aplicacao.empresa.cardapios.categorias.item.updateComplemento');
                        Route::delete('/{grupo_id}/complementos/{complemento_id}', [GrupoComplementoController::class, 'destroyComplemento'])->name('aplicacao.empresa.cardapios.categorias.item.destroyComplemento');
                    });
                });
                Route::prefix('{categoria_id}/combos')->group(function () {
                    Route::post('/', [ComboController::class, 'store'])->name('aplicacao.empresa.cardapios.categorias.combo.store');
                    Route::get('buscaItensParaCombo', [ComboController::class, 'buscaItensParaCombo'])->name('aplicacao.empresa.cardapios.categorias.combo.buscaItensParaCombo');
                    Route::get('buscaGruposComplementoParaCombo', [ComboController::class, 'buscaGruposComplementoParaCombo'])->name('aplicacao.empresa.cardapios.categorias.combo.buscaGruposComplementoParaCombo');
                    Route::get('/{combo_id}', [ComboController::class, 'show'])->name('aplicacao.empresa.cardapios.categorias.combo.show');
                    Route::put('/{combo_id}', [ComboController::class, 'update'])->name('aplicacao.empresa.cardapios.categorias.combo.update');
                    Route::patch('/{combo_id}/codpdv', [ComboController::class, 'updateCodPdv'])->name('aplicacao.empresa.cardapios.categorias.combo.updateCodPdv');
                    Route::patch('/{combo_id}/preco', [ComboController::class, 'updatePreco'])->name('aplicacao.empresa.cardapios.categorias.combo.updatePreco');
                });
            });
        });
        Route::prefix('ajuda/bug')->group(function () {
            Route::get('/', [BugReportController::class, 'index'])->name('aplicacao.empresa.ajuda.bug.index');
            Route::post('/', [BugReportController::class, 'store'])->name('aplicacao.empresa.ajuda.bug.store');
        });
    });
});

Route::group([], function () {
    Route::get('/meus-pedidos', [MeusPedidosController::class, 'index'])->name('aplicacao.cliente.meus-pedidos');

    Route::prefix('chat')->group(function () {
        Route::get('/conversas', [ClienteChatController::class, 'conversas'])->name('aplicacao.cliente.chat.conversas');
        Route::get('/{pedido_id}/mensagens', [ClienteChatController::class, 'mensagens'])->name('aplicacao.cliente.chat.mensagens');
        Route::post('/{pedido_id}/mensagens', [ClienteChatController::class, 'enviarMensagem'])->name('aplicacao.cliente.chat.mensagens.store');
    });

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

    Route::prefix('pedidos/imprimir')->group(function () {
        Route::get('/{pedido_id}', [PedidoImpressaoController::class, 'pdf'])->name('pedido.imprimir')->middleware('signed');
        Route::get('/{pedido_id}/txt', [PedidoImpressaoController::class, 'txt'])->name('pedido.imprimir.txt')->middleware('signed');
        Route::get('/{pedido_id}/escpos', [PedidoImpressaoController::class, 'escpos'])->name('pedido.imprimir.escpos')->middleware('signed');
    });
});
