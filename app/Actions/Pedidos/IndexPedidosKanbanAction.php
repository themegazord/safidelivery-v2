<?php

namespace App\Actions\Pedidos;

use App\Models\Empresa;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class IndexPedidosKanbanAction
{
    public function handle(Empresa $empresa, ?Carbon $dia = null): Collection
    {
        $tz = $empresa->resolveTimezone();
        $base = $dia?->copy()->timezone($tz) ?? Carbon::now($tz);

        $startUtc = $base->copy()->startOfDay()->setTimezone('UTC');
        $endUtc = $base->copy()->endOfDay()->setTimezone('UTC');

        return $empresa->pedidos()
            ->with(['cliente', 'financeiro', 'dadosRetiradaPedido', 'enderecoEntrega', 'enderecoEntregaIfood'])
            ->whereBetween('created_at', [$startUtc, $endUtc])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
