<?php

namespace App\Actions\Fidelidade;

use App\Models\Empresa;
use App\Models\FidelidadeConfig;

class AtualizaFidelidadeConfigAction
{
    public function handle(Empresa $empresa, array $dados): FidelidadeConfig
    {
        if (in_array($dados['tipo_recompensa'] ?? null, ['frete_gratis', 'item_gratis'], true)) {
            $dados['valor_recompensa'] = null;
        }

        if (($dados['tipo_recompensa'] ?? null) !== 'item_gratis') {
            $dados['valor_max_premio'] = null;
            $dados['categorias_bloqueadas'] = [];
        }

        return FidelidadeConfig::query()->updateOrCreate(
            ['empresa_id' => $empresa->getAttribute('id')],
            $dados,
        );
    }
}
