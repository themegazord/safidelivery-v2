<?php

namespace App\Actions\FormaPagamento;

use App\Models\FormaPagamento;

class AtualizaFormaPagamentoAction
{
    public function handle(FormaPagamento $formaPagamento, array $dados): void
    {
        $formaPagamento->update([
            'descricao' => $dados['descricao'],
            'tipo' => $dados['tipo'],
            'codigo_pdv' => $dados['codigo_pdv'] ?? null,
            'interno' => $dados['interno'],
        ]);
    }
}
