<?php

namespace App\Actions\Cliente;

use App\Models\FidelidadeConfig;
use App\Models\FidelidadeProgresso;
use Illuminate\Support\Collection;

class ResumoFidelidadeClienteAction
{
    public function handle(int $clienteId): Collection
    {
        $progressos = FidelidadeProgresso::where('cliente_id', $clienteId)
            ->with('empresa')
            ->get();

        $empresaIds = $progressos->pluck('empresa_id')->unique()->values();

        $configs = FidelidadeConfig::whereIn('empresa_id', $empresaIds)
            ->where('ativo', true)
            ->get()
            ->keyBy('empresa_id');

        return $progressos
            ->filter(fn ($p) => $configs->has($p->empresa_id))
            ->map(function ($progresso) use ($configs) {
                $config = $configs[$progresso->empresa_id];
                $percentual = $progresso->percentualProgresso($config->valor_gatilho, $config->tipo_gatilho);

                return [
                    'empresa_nome' => $progresso->empresa->nome_fantasia,
                    'tipo_gatilho' => $config->tipo_gatilho,
                    'valor_gatilho' => $config->valor_gatilho,
                    'tipo_recompensa' => $config->tipo_recompensa,
                    'valor_recompensa' => $config->valor_recompensa,
                    'contador_atual' => $progresso->contador_atual,
                    'valor_acumulado' => $progresso->valor_acumulado,
                    'percentual' => $percentual,
                    'recompensa_disponivel' => $progresso->recompensa_disponivel,
                    'recompensa_expira_em' => $progresso->recompensa_expira_em,
                ];
            })
            ->values();
    }
}
