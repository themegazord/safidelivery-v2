<?php

namespace App\Actions\Clientes;

use App\Models\Cliente;
use App\Models\Empresa;
use App\Models\FidelidadeConfig;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class IndexClientesAction
{
    public function handle(Empresa $empresa, array $filtros, ?FidelidadeConfig $fidelidadeConfig, ?int $diasInatividadeCliente): LengthAwarePaginator
    {
        $empresaId = $empresa->getAttribute('id');

        $cashbackSub = DB::table('cashback_creditos')
            ->where('empresa_id', $empresaId)
            ->where('data_vencimento', '>=', now())
            ->where('saldo_restante', '>', 0)
            ->groupBy('cliente_id')
            ->selectRaw('cliente_id, SUM(saldo_restante) as saldo_cashback');

        $ordenarPor = $filtros['sort_by'] ?? 'nome';
        $ordenarDirecao = ($filtros['sort_dir'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $colunasOrdenaveis = ['nome', 'primeira_compra', 'ultima_compra', 'total_pedidos', 'valor_total_gasto', 'ticket_medio'];
        if (! in_array($ordenarPor, $colunasOrdenaveis, true)) {
            $ordenarPor = 'nome';
        }

        $query = Cliente::query()
            ->select([
                'clientes.id',
                'clientes.nome',
                'clientes.telefone',
            ])
            ->selectRaw('MIN(pedidos.created_at) as primeira_compra')
            ->selectRaw('MAX(pedidos.created_at) as ultima_compra')
            ->selectRaw('SUM(financeiro_pedido.subtotal_itens) as valor_total_gasto')
            ->selectRaw('COUNT(pedidos.id) as total_pedidos')
            ->selectRaw('SUM(financeiro_pedido.subtotal_itens) / COUNT(pedidos.id) as ticket_medio')
            ->selectRaw('COALESCE(cb.saldo_cashback, 0) as saldo_cashback')
            ->selectRaw('COALESCE(fp.contador_atual, 0) as pontos_fidelidade')
            ->selectRaw('COALESCE(fp.valor_acumulado, 0) as valor_acumulado_fidelidade')
            ->selectRaw('COALESCE(fp.recompensa_disponivel, 0) as recompensa_disponivel')
            ->join('pedidos', 'pedidos.cliente_id', '=', 'clientes.id')
            ->join('financeiro_pedido', 'financeiro_pedido.pedido_id', '=', 'pedidos.id')
            ->leftJoinSub($cashbackSub, 'cb', 'cb.cliente_id', '=', 'clientes.id')
            ->leftJoin('fidelidade_progressos as fp', function ($join) use ($empresaId) {
                $join->on('fp.cliente_id', '=', 'clientes.id')
                    ->where('fp.empresa_id', '=', $empresaId);
            })
            ->where('pedidos.empresa_id', $empresaId)
            ->whereIn('pedidos.status', ['entregue', 'pedido feito'])
            ->whereNull('pedidos.deleted_at')
            ->groupBy('clientes.id', 'clientes.nome', 'clientes.telefone', 'cb.saldo_cashback', 'fp.contador_atual', 'fp.valor_acumulado', 'fp.recompensa_disponivel')
            ->when($filtros['nome'] ?? null, fn ($q, $nome) => $q->where('clientes.nome', 'like', "%$nome%"))
            ->when($filtros['telefone'] ?? null, fn ($q, $telefone) => $q->where('clientes.telefone', 'like', "%$telefone%"))
            ->when($filtros['primeira_compra_inicio'] ?? null, fn ($q, $data) => $q->havingRaw('MIN(pedidos.created_at) >= ?', [$data]))
            ->when($filtros['primeira_compra_fim'] ?? null, fn ($q, $data) => $q->havingRaw('MIN(pedidos.created_at) <= ?', [$data.' 23:59:59']))
            ->when($filtros['ultima_compra_inicio'] ?? null, fn ($q, $data) => $q->havingRaw('MAX(pedidos.created_at) >= ?', [$data]))
            ->when($filtros['ultima_compra_fim'] ?? null, fn ($q, $data) => $q->havingRaw('MAX(pedidos.created_at) <= ?', [$data.' 23:59:59']))
            ->when(($filtros['proximo_meta'] ?? false) && $fidelidadeConfig, function ($q) use ($fidelidadeConfig) {
                $limiarInferior = $fidelidadeConfig->getAttribute('valor_gatilho') * 0.7;
                $campo = $fidelidadeConfig->getAttribute('tipo_gatilho') === 'qtd_pedidos' ? 'fp.contador_atual' : 'fp.valor_acumulado';

                $q->where('fp.recompensa_disponivel', false)
                    ->havingRaw("COALESCE($campo, 0) >= ?", [$limiarInferior])
                    ->havingRaw("COALESCE($campo, 0) < ?", [$fidelidadeConfig->getAttribute('valor_gatilho')]);
            })
            ->orderBy($ordenarPor, $ordenarDirecao);

        $paginador = $query->paginate(20)->withQueryString();

        if ($diasInatividadeCliente) {
            $limite = now()->subDays($diasInatividadeCliente);
            $paginador->getCollection()->each(function (Cliente $cliente) use ($limite) {
                $ultimaCompra = $cliente->getAttribute('ultima_compra');
                $cliente->setAttribute('esta_ativo', $ultimaCompra ? Carbon::parse($ultimaCompra)->greaterThanOrEqualTo($limite) : false);
            });
        }

        return $paginador;
    }
}
