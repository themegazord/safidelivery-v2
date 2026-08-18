<?php

namespace App\Actions\Pedidos;

use App\Models\Pedido;
use App\Services\IFOOD\ApiExternalIfood;

class BuscaMotivosCancelamentoIfoodAction
{
    public function __construct(private ApiExternalIfood $api)
    {
    }

    public function handle(Pedido $pedido): array
    {
        if ($pedido->pedido_ifood_id === null) {
            return [];
        }

        $resposta = $this->api->solicitarMotivosCancelamentoIfood($pedido->empresa_id, $pedido->pedido_ifood_id);

        return $resposta->ok() ? $resposta->json() : [];
    }
}
