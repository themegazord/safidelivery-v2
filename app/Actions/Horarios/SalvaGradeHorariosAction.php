<?php

namespace App\Actions\Horarios;

use App\Models\Empresa;
use App\Models\HorarioFuncionamento;

class SalvaGradeHorariosAction
{
    public function handle(Empresa $empresa, string $tipoFuncionamento, array $horarios): void
    {
        HorarioFuncionamento::query()
            ->where('empresa_id', $empresa->getAttribute('id'))
            ->where('tipo_funcionamento', $tipoFuncionamento)
            ->delete();

        foreach ($horarios as $horario) {
            HorarioFuncionamento::query()->create([
                'empresa_id' => $empresa->getAttribute('id'),
                'tipo_funcionamento' => $tipoFuncionamento,
                'dia_semana' => $horario['dia_semana'],
                'status' => $horario['status'],
                'hora_inicio' => $horario['hora_inicio'],
                'hora_fim' => $horario['hora_fim'],
            ]);
        }
    }
}
