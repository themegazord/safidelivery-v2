<?php

namespace App\Actions\Pedidos;

use App\Models\JustificativaCancelamentoPedido;
use App\Models\Pedido;
use App\Services\IFOOD\ApiExternalIfood;
use Exception;

class CancelaPedidoAction
{
    public function __construct(private ApiExternalIfood $api)
    {
    }

    public function handle(Pedido $pedido, array $dados): string
    {
        if ($pedido->pedido_ifood_id !== null) {
            $resposta = $this->api->solicitarCancelamentoIfood(
                $pedido->empresa_id,
                $pedido->pedido_ifood_id,
                $dados['motivo_descricao'],
                $dados['motivo_codigo'],
            );

            if ($resposta->status() !== 202) {
                throw new Exception('Erro ao tentar o cancelamento do pedido no ifood. Entrar em contato com o suporte.');
            }

            if ($resposta->accepted()) {
                JustificativaCancelamentoPedido::create([
                    'pedido_id' => $pedido->id,
                    'origem_cancelamento' => 'empresa',
                    'motivo' => $dados['motivo_descricao'],
                ]);
            }

            return 'Solicitação de cancelamento feita, aguarde a resposta do ifood.';
        }

        JustificativaCancelamentoPedido::create([
            'pedido_id' => $pedido->id,
            'origem_cancelamento' => 'empresa',
            'motivo' => $dados['mensagem'],
        ]);

        $pedido->update(['status' => 'cancelado']);

        return 'Pedido cancelado com sucesso';
    }
}
