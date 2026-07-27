<?php

namespace App\Actions\FinalizarPedido;

use App\Models\Empresa;
use App\Models\Promocao;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ListaCuponsVisiveisAction
{
    public function handle(Empresa $empresa): array
    {
        $hoje = (int) now()->format('w');
        $agora = now();

        return $empresa->promocoes
            ->filter(function (Promocao $cupom) use ($hoje, $agora) {
                if (! $cupom->getAttribute('cupom_visivel')) {
                    return false;
                }

                if ($agora->gt(Carbon::parse($cupom->getAttribute('data_vencimento')))) {
                    return false;
                }

                $dias = json_decode($cupom->getAttribute('dias_disponiveis'), true) ?? [];
                if (! in_array($hoje, $dias, true)) {
                    return false;
                }

                $totalUsos = DB::table('promocao_usada')->where('promocao_id', $cupom->getAttribute('id'))->count();
                if ($totalUsos >= $cupom->getAttribute('qtde_usos')) {
                    return false;
                }

                return true;
            })
            ->values()
            ->map(fn (Promocao $cupom) => [
                'nome_cupom' => $cupom->getAttribute('nome_cupom'),
                'tipo_cupom' => $cupom->getAttribute('tipo_cupom'),
                'onde_afetara' => $cupom->getAttribute('onde_afetara'),
                'valor_desconto' => (float) $cupom->getAttribute('valor_desconto'),
            ])
            ->all();
    }
}
