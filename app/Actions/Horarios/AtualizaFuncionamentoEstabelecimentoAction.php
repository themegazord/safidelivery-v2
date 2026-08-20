<?php

namespace App\Actions\Horarios;

use App\Models\Configuracao;
use App\Models\Empresa;
use Illuminate\Support\Facades\Cache;

class AtualizaFuncionamentoEstabelecimentoAction
{
    public function handle(Empresa $empresa, string $funcionamentoEstabelecimento, int $fusoHorario): void
    {
        Configuracao::updateOrCreate(
            ['empresa_id' => $empresa->getAttribute('id'), 'configuracao' => 'funcionamentoEstabelecimento'],
            ['valor' => $funcionamentoEstabelecimento]
        );

        Configuracao::updateOrCreate(
            ['empresa_id' => $empresa->getAttribute('id'), 'configuracao' => 'fuso_horario'],
            ['valor' => $fusoHorario]
        );

        Cache::forget("empresa:{$empresa->getAttribute('id')}:timezone");
    }
}
