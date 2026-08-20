<?php

namespace App\Actions\QrCodeMesa;

use App\Models\Empresa;
use App\Models\Mesa;

class CriaMesaAction
{
    public function handle(Empresa $empresa, int $numeroMesa): Mesa
    {
        return Mesa::query()->create([
            'empresa_id' => $empresa->getAttribute('id'),
            'mesa' => $numeroMesa,
            'link_gerado' => Mesa::geraLink($empresa->getAttribute('interacao_id'), $numeroMesa),
        ]);
    }
}
