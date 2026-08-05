<?php

namespace App\Http\Controllers\Empresa\ConfigEmpresa;

use App\Actions\ConfigEmpresa\AtualizarIntegracaoAction;
use App\Http\Requests\ConfigEmpresa\AtualizaIntegracaoRequest;
use App\Models\Empresa;
use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class IntegracoesController {
  public function index() {
    $cnpj = request()->cnpj;
    $empresa = Empresa::query()->where('cnpj', $cnpj)->first();
    $integracoes = $empresa->integracoes()->get(['chavesecreta_pagarme', 'clientId', 'clientSecret', 'companyToken', 'id', 'empresa_id', 'merchantId', 'tipo']);
    return Inertia::render('Empresa/SuaLoja/Integracoes', [
      'integracoes' => $integracoes
    ]);
  }

  public function geraCompanyToken() {
    return response()->json(['companyToken' => uuid_create()], Response::HTTP_CREATED);
  }

  public function update(AtualizaIntegracaoRequest $request) {
    $dados = $request->validated();
    $empresa = Empresa::query()->where('cnpj', $dados['cnpj'])->first();
    $action = new AtualizarIntegracaoAction();

    try {
      $integracao = $action->handle($empresa, $dados['integracao']);
    } catch (Exception $e) {
      // TODO: avaliar se esse erro deveria ser relançado em vez de apenas logado.
      Log::error('Erro ao atualizar integração da empresa', [
        'empresa_id' => $empresa->id ?? null,
        'tipo' => $dados['integracao']['tipo'] ?? null,
        'erro' => $e->getMessage(),
      ]);

      return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 422);
    }

    return response()->json(['mensagem' => "Integração atualizada com sucesso", 'integracao' => $integracao]);
  }
}