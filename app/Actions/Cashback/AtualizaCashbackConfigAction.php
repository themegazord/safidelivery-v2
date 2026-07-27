<?php

namespace App\Actions\Cashback;

use App\Models\CashbackConfig;
use App\Models\Empresa;

class AtualizaCashbackConfigAction
{
    public function handle(Empresa $empresa, array $dados): CashbackConfig
    {
        return CashbackConfig::query()->updateOrCreate(
            ['empresa_id' => $empresa->getAttribute('id')],
            $dados,
        );
    }
}
