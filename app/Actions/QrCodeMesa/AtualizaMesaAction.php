<?php

namespace App\Actions\QrCodeMesa;

use App\Models\Empresa;
use App\Models\Mesa;

class AtualizaMesaAction
{
    public function handle(Empresa $empresa, Mesa $mesa, int $numeroMesa): void
    {
        $mesa->update([
            'mesa' => $numeroMesa,
            'link_gerado' => Mesa::geraLink($empresa->getAttribute('interacao_id'), $numeroMesa),
        ]);
    }
}
