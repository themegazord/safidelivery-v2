<?php

namespace App\Actions\ConfigEntrega;

use App\Models\Empresa;
use App\Models\TaxaEntrega;

class SalvaTaxasEntregaAction
{
    public function handle(Empresa $empresa, array $taxas): void
    {
        TaxaEntrega::query()->where('empresa_id', $empresa->getAttribute('id'))->delete();

        foreach ($taxas as $taxa) {
            TaxaEntrega::query()->create([
                'empresa_id' => $empresa->getAttribute('id'),
                'tipo' => $taxa['tipo'] ?? 'raio',
                'raio' => $taxa['raio'] ?? 0,
                'tempo' => $taxa['tempo'],
                'taxa' => $taxa['taxa'],
                'corCirculo' => $taxa['corCirculo'],
                'corPreenchimento' => $taxa['corPreenchimento'],
                'coordenadas' => ! empty($taxa['coordenadas']) ? $taxa['coordenadas'] : null,
            ]);
        }
    }
}
