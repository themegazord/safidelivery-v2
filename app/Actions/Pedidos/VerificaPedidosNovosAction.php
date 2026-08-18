<?php

namespace App\Actions\Pedidos;

use App\Models\Empresa;
use App\Models\Pedido;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class VerificaPedidosNovosAction
{
    public function __construct(private IndexPedidosKanbanAction $indexPedidos)
    {
    }

    public function handle(Empresa $empresa): array
    {
        $tz = $empresa->resolveTimezone();
        $hoje = Carbon::now($tz);
        $cacheKey = "pedidosNovos:{$empresa->id}:{$hoje->toDateString()}";
        $lockKey = "pedidosNovos:lock:{$empresa->id}";

        $startUtc = $hoje->copy()->startOfDay()->setTimezone('UTC');
        $endUtc = $hoje->copy()->endOfDay()->setTimezone('UTC');
        $ttl = now()->diffInSeconds($hoje->copy()->addDay()->startOfDay());

        // Lock não-bloqueante: se outra requisição (outra aba, outro poll) já está
        // com o lock, não vale a pena esperar — só pula a checagem de "novos" desta
        // vez e devolve a lista atualizada mesmo assim (evita empilhar requisições
        // presas em fila por causa do polling de 5 em 5 segundos).
        $resultado = Cache::lock($lockKey, 5)->get(function () use ($empresa, $cacheKey, $ttl, $startUtc, $endUtc) {
            $cachedIds = collect(Cache::get($cacheKey, []));

            $pendentesHojeIds = Pedido::query()
                ->where('empresa_id', $empresa->id)
                ->whereIn('status', ['pendente', 'aguardando_item_premio', 'sendo preparado', 'pedido feito'])
                ->whereBetween('created_at', [$startUtc, $endUtc])
                ->pluck('id');

            $novosIds = $pendentesHojeIds->diff($cachedIds);

            Cache::put($cacheKey, $pendentesHojeIds->values()->all(), $ttl);

            return $novosIds->isNotEmpty();
        });

        return [
            'tocar_som' => $resultado ?? false,
            'pedidos' => $this->indexPedidos->handle($empresa, $hoje),
        ];
    }
}
