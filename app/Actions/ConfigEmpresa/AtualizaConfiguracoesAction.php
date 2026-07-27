<?php

namespace App\Actions\ConfigEmpresa;

use App\Models\Configuracao;
use App\Models\Empresa;

class AtualizaConfiguracoesAction
{
    public const CONFIGURACOES_GERENCIADAS = [
        'aceite_automatico',
        'aceite_automatico_ifood',
        'media_tempo_preparo',
        'modo_calculo_frete',
        'replicar_informacao_importacao',
        'informa_mesa_comanda',
        'modo_atendente',
        'periodo_inatividade_cliente',
        'fora_area_entrega',
        'multiplas_formas_pagamento',
    ];

    public function handle(Empresa $empresa, array $configuracoes): void
    {
        foreach ($configuracoes as $configuracao => $valor) {
            if (! in_array($configuracao, self::CONFIGURACOES_GERENCIADAS, true)) {
                continue;
            }

            if ($configuracao === 'periodo_inatividade_cliente' && (int) $valor === 0) {
                $valor = null;
            }

            Configuracao::updateOrCreate(
                [
                    'empresa_id' => $empresa->getAttribute('id'),
                    'configuracao' => $configuracao,
                ],
                ['valor' => $valor]
            );
        }
    }
}
