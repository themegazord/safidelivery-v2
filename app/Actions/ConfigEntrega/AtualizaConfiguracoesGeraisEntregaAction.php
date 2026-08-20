<?php

namespace App\Actions\ConfigEntrega;

use App\Models\Configuracao;
use App\Models\Empresa;

class AtualizaConfiguracoesGeraisEntregaAction
{
    private const CONFIGURACOES_MONETARIAS = ['taxa_fixa', 'valor_minimo_pedido', 'frete_gratis_acima'];

    public function handle(Empresa $empresa, array $dados): void
    {
        $configuracoes = [
            'taxa_fixa' => $dados['taxa_fixa'] ?? null,
            'valor_minimo_pedido' => $dados['valor_minimo_pedido'] ?? null,
            'frete_gratis_acima' => $dados['frete_gratis_acima'] ?? null,
            'prioridade_zona_sobreposicao' => $dados['prioridade_zona_sobreposicao'],
        ];

        foreach ($configuracoes as $chave => $valor) {
            if (in_array($chave, self::CONFIGURACOES_MONETARIAS, true) && floatval($valor) <= 0) {
                $valor = null;
            }

            Configuracao::updateOrCreate(
                ['empresa_id' => $empresa->getAttribute('id'), 'configuracao' => $chave],
                ['valor' => $valor]
            );
        }
    }
}
