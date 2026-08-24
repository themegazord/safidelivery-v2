<?php

namespace App\Http\Controllers\Empresa\ConfigEmpresa;

use App\Actions\ConfigEmpresa\AtualizarIntegracaoAction;
use App\Http\Requests\ConfigEmpresa\AtualizaIntegracaoRequest;
use App\Models\Empresa;
use App\Models\Integracao;
use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class IntegracoesController {
  // Placeholder enviado no lugar de segredos de terceiros (chave Pagar.me, token Anota.ai):
  // essas credenciais são só de escrita — o front nunca precisa reexibir o valor real.
  private const SEGREDO_MASCARADO = '••••••••';

  public function index() {
    $cnpj = request()->cnpj;
    $empresa = Empresa::query()->where('cnpj', $cnpj)->first();
    $integracoes = $empresa->integracoes()->get(['chavesecreta_pagarme', 'clientId', 'clientSecret', 'companyToken', 'id', 'empresa_id', 'merchantId', 'tipo'])
      ->map(fn (Integracao $integracao) => $this->mascaraSegredos($integracao));

    return Inertia::render('Empresa/SuaLoja/Integracoes', [
      'integracoes' => $integracoes
    ]);
  }

  private function mascaraSegredos(Integracao $integracao): array
  {
    $dados = $integracao->toArray();

    // O companyToken da integração "safi" é gerado por nós para o próprio lojista usar em
    // sistemas externos (não é segredo de terceiros) — precisa continuar visível para cópia.
    // clientId/merchantId do iFood são identificadores, não segredos.
    if ($integracao->getAttribute('tipo') === 'pagarme' && $dados['chavesecreta_pagarme']) {
      $dados['chavesecreta_pagarme'] = self::SEGREDO_MASCARADO;
    }

    if ($integracao->getAttribute('tipo') === 'anotaai' && $dados['companyToken']) {
      $dados['companyToken'] = self::SEGREDO_MASCARADO;
    }

    return $dados;
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
      Log::error('Erro ao atualizar integração da empresa', [
        'empresa_id' => $empresa->id ?? null,
        'tipo' => $dados['integracao']['tipo'] ?? null,
        'erro' => $e->getMessage(),
      ]);

      return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 422);
    }

    return response()->json([
      'mensagem' => "Integração atualizada com sucesso",
      'integracao' => $integracao ? $this->mascaraSegredos($integracao) : null,
    ]);
  }
}