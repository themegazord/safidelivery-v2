<?php

namespace App\Actions\Pedidos;

use App\Models\Empresa;
use App\Models\Notificacao;
use App\Services\IFOOD\ApiExternalIfood;
use Exception;

class RespondeNegociacaoAction
{
    public function __construct(private ApiExternalIfood $api)
    {
    }

    public function handle(Empresa $empresa, Notificacao $notificacao, string $tipoProposta, array $negociacao): array
    {
        $this->valida($tipoProposta, $negociacao, $notificacao);

        $negociacao['tipo_proposta'] = $tipoProposta;

        $resultado = $this->api->enviaRespostaNegociacao(
            $empresa->getAttribute('id'),
            $notificacao->data['metadata']['disputeId'],
            $negociacao,
        );

        $this->api->consultaListagemPedidos($empresa->getAttribute('id'));

        return $resultado;
    }

    private function valida(string $tipoProposta, array $negociacao, Notificacao $notificacao): void
    {
        $decisao = $negociacao['decisao'] ?? null;

        if ($tipoProposta === 'DELAY') {
            if ($decisao === 'aceitar') {
                $this->obrigatorio($negociacao, 'minutos_adicionais');
                $this->obrigatorio($negociacao, 'motivo');
            }
            if ($decisao === 'recusar') {
                $this->obrigatorio($negociacao, 'motivo');
                $this->obrigatorio($negociacao, 'razao');
            }
        }

        if (in_array($tipoProposta, ['AFTER_DELIVERY', 'AFTER_DELIVERY_PARTIALLY'], true)) {
            if ($decisao === 'proposta') {
                $this->obrigatorio($negociacao, 'valor_contraproposta');

                $alternativa = $notificacao->data['metadata']['alternatives'][0] ?? null;
                $valorMaximo = $alternativa ? ($alternativa['maxAmount']['value'] ?? 0) / 100 : null;

                if ($valorMaximo !== null && $negociacao['valor_contraproposta'] > $valorMaximo) {
                    throw new Exception('O valor deve ser menor ou igual a R$'.number_format($valorMaximo, 2, ',', '.'));
                }
            }
            if ($decisao === 'recusar') {
                $this->obrigatorio($negociacao, 'razao');
            }
        }

        if ($tipoProposta === 'PREPARATION_TIME' && $decisao === 'recusar') {
            $this->obrigatorio($negociacao, 'razao');
        }
    }

    private function obrigatorio(array $negociacao, string $campo): void
    {
        if (empty($negociacao[$campo])) {
            throw new Exception("Campo obrigatório: {$campo}");
        }
    }
}
