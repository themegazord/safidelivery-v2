<?php

namespace App\Actions\Pedidos;

use App\Models\Empresa;
use App\Models\Notificacao;
use Carbon\Carbon;

class MarcarNotificacoesLidasAction
{
    public function handle(Empresa $empresa, array $ids): void
    {
        Notificacao::query()
            ->where('empresa_id', $empresa->getAttribute('id'))
            ->whereIn('id', $ids)
            ->update(['lida' => true, 'lida_em' => Carbon::now()]);
    }
}
