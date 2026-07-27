<?php

namespace App\Actions\ConfigEmpresa;

use App\Models\Empresa;
use App\Models\Integracao;
use App\Services\IFOOD\ApiExternalIfood;
use Exception;

class AtualizarIntegracaoAction
{
  public function handle(Empresa $empresa, array $dados_integracao): ?Integracao
  {
    return match($dados_integracao['tipo']) {
      'safi' => $this->handleSAFI($empresa, $dados_integracao),
      'pagarme' => $this->handlePagarme($empresa, $dados_integracao),
      'ifood' => $this->handleIFOOD($empresa, $dados_integracao),
      'anotaai' => $this->handleAnotaai($empresa, $dados_integracao)
    };
  }

  private function atualizaIntegracao(int $empresa_id, string $tipo, array $dados): Integracao
  {
    return Integracao::query()->updateOrCreate([
      'empresa_id' => $empresa_id,
      'tipo' => $tipo
    ], $dados);
  }

  private function removeIntegracao(int $empresa_id, string $tipo): void
  {
    Integracao::query()->where('empresa_id', $empresa_id)->where('tipo', $tipo)->delete();
  }

  private function handleSAFI(Empresa $empresa, array $dados_integracao): ?Integracao
  {
    if (empty($dados_integracao['companyToken'])) {
      $this->removeIntegracao($empresa->getAttribute('id'), $dados_integracao['tipo']);
      return null;
    }

    return $this->atualizaIntegracao($empresa->getAttribute('id'), $dados_integracao['tipo'], [
      'companyToken' => $dados_integracao['companyToken']
    ]);
  }

  private function handlePagarme(Empresa $empresa, array $dados_integracao): ?Integracao
  {
    if (empty($dados_integracao['chavesecreta_pagarme'])) {
      $this->removeIntegracao($empresa->getAttribute('id'), $dados_integracao['tipo']);
      return null;
    }

    return $this->atualizaIntegracao($empresa->getAttribute('id'), $dados_integracao['tipo'], [
      'chavesecreta_pagarme' => $dados_integracao['chavesecreta_pagarme']
    ]);
  }

  private function handleIFOOD(Empresa $empresa, array $dados_integracao): ?Integracao
  {
    $clientId = $dados_integracao['clientId'] ?? null;
    $clientSecret = $dados_integracao['clientSecret'] ?? null;
    $merchantId = $dados_integracao['merchantId'] ?? null;

    if (empty($clientId) && empty($clientSecret) && empty($merchantId)) {
      $this->removeIntegracao($empresa->getAttribute('id'), $dados_integracao['tipo']);
      $empresa->update([
        'tokenIfood' => null,
        'lifetimeTokenIfood' => null
      ]);
      return null;
    }

    if (empty($clientId) || empty($clientSecret) || empty($merchantId)) {
      throw new Exception('Preencha o Client ID, o Client Secret e o Merchant ID para salvar a integração com o iFood.', 422);
    }

    try {
      $dadosToken = app(ApiExternalIfood::class)->autenticacaoComCredenciais($clientId, $clientSecret);
    } catch (Exception $e) {
      throw new Exception($e->getMessage(), $e->getCode() ?: 422, $e);
    }

    $integracaoIFOOD = $this->atualizaIntegracao($empresa->getAttribute('id'), $dados_integracao['tipo'], [
      'clientId' => $clientId,
      'clientSecret' => $clientSecret,
      'merchantId' => $merchantId,
    ]);

    $empresa->update([
      'tokenIfood' => $dadosToken['accessToken'],
      'lifetimeTokenIfood' => now()->addSeconds($dadosToken['expiresIn'])
    ]);

    return $integracaoIFOOD;
  }

  private function handleAnotaai(Empresa $empresa, array $dados_integracao): ?Integracao
  {
    if (empty($dados_integracao['companyToken'])) {
      $this->removeIntegracao($empresa->getAttribute('id'), $dados_integracao['tipo']);
      return null;
    }

    return $this->atualizaIntegracao($empresa->getAttribute('id'), $dados_integracao['tipo'], [
      'companyToken' => $dados_integracao['companyToken']
    ]);
  }
}
