<?php

namespace App\Actions\Horarios;

use App\Models\Empresa;
use App\Models\HorarioIndisponibilidade;

class CadastraIndisponibilidadeAction
{
    public function handle(Empresa $empresa, array $dados): HorarioIndisponibilidade
    {
        return HorarioIndisponibilidade::query()->create([
            'empresa_id' => $empresa->getAttribute('id'),
            'titulo' => $dados['titulo'],
            'descricao' => $dados['descricao'] ?? null,
            'data_inicio' => $dados['data_inicio'],
            'data_fim' => $dados['data_fim'],
        ]);
    }
}
