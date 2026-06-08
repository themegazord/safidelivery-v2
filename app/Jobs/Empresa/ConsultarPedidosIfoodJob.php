<?php

namespace App\Jobs\Empresa;

use App\Models\Empresa;
use App\Services\IFOOD\ApiExternalIfood;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ConsultarPedidosIfoodJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $empresa_id) {}

    public function handle(ApiExternalIfood $api): void
    {
        $empresa = Empresa::find($this->empresa_id);

        if (! $empresa || ! $empresa->getAttribute('esta_recebendo_pedidos_ifood')) {
            return;
        }

        $api->consultaListagemPedidos($empresa->getAttribute('id'));
    }
}
