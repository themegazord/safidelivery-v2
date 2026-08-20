<?php

namespace App\Actions\FormaPagamento;

use App\Models\Empresa;
use App\Models\FormaPagamento;

class CriaFormaPagamentoAction
{
    public function handle(Empresa $empresa, array $dados): FormaPagamento
    {
        return FormaPagamento::query()->create([
            'empresa_id' => $empresa->getAttribute('id'),
            'descricao' => $dados['descricao'],
            'tipo' => $dados['tipo'],
            'codigo_pdv' => $dados['codigo_pdv'] ?? null,
            'interno' => $dados['interno'],
        ]);
    }
}
