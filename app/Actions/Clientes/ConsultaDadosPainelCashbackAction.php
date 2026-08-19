<?php

namespace App\Actions\Clientes;

use App\Models\CashbackConfig;
use App\Models\FidelidadeConfig;
use App\Models\FidelidadeProgresso;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ConsultaDadosPainelCashbackAction
{
    /**
     * @throws \Throwable
     */
    public function handle(int $empresa_id, ?FidelidadeConfig $fidelidadeConfig): array {
        $cashback = null;
        try {
            $cashback = DB::table('cashback_creditos')
                ->where('empresa_id', $empresa_id)
                ->selectRaw('
                SUM(credito_gerado) as total_emitido,
                SUM(credito_gerado - saldo_restante) as total_utilizado,
                SUM(CASE WHEN data_vencimento BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY) AND saldo_restante > 0 THEN saldo_restante ELSE 0 END) as a_vencer_30d,
                SUM(CASE WHEN data_vencimento >= NOW() AND saldo_restante > 0 THEN saldo_restante ELSE 0 END) as saldo_ativo
            ')->firstOrFail();
        } catch (\Exception $e) {
            Log::error('Não foi possivel fazer a consulta dos dados do painel de cashback', ['exception' => $e, 'message' => $e->getMessage(), 'empresa_id' => $empresa_id]);
            throw new \Exception($e->getMessage());
        }

        $clientesComRecompensa = FidelidadeProgresso::query()->where('empresa_id', $empresa_id)
            ->where('recompensa_disponivel', true)
            ->count();

        $clientesProximosMeta = 0;

        if ($fidelidadeConfig) {
            $config = $fidelidadeConfig;
            $limiar = $config->getAttribute('valor_gatilho') * 0.7;
            $campo = $config->getAttribute('tipo_gatilho') === 'qtd_pedidos' ? 'contador_atual' : 'valor_acumulado';
            $clientesProximosMeta = FidelidadeProgresso::query()->where('empresa_id', $empresa_id)
                ->where('recompensa_disponivel', false)
                ->where($campo, '>=', $limiar)
                ->where($campo, '<', $config->getAttribute('valor_gatilho'))
                ->count();
        }

        return [
            'cashback_emitido' => $cashback?->total_emitido ?? 0,
            'cashback_utilizado' => $cashback?->total_utilizado ?? 0,
            'cashback_a_vencer_30d' => $cashback?->a_vencer_30d ?? 0,
            'cashback_saldo_ativo' => $cashback?->saldo_ativo ?? 0,
            'clientes_com_recompensa' => $clientesComRecompensa,
            'clientes_proximos_meta' => $clientesProximosMeta,
        ];
    }
}
