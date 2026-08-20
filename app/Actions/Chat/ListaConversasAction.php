<?php

namespace App\Actions\Chat;

use App\Models\Chat;
use App\Models\Pedido;
use App\Models\User;
use Illuminate\Support\Collection;

class ListaConversasAction
{
    /**
     * @param  Collection<int, Pedido>  $pedidos
     * @return array<int, array<string, mixed>>
     */
    public function handle(Collection $pedidos, User $usuario, bool $ladoEmpresa): array
    {
        return $pedidos
            ->map(function (Pedido $pedido) use ($usuario, $ladoEmpresa) {
                $chat = Chat::query()->where('pedido_id', $pedido->getAttribute('id'))->first();

                $ultimaMensagem = null;
                $naoLidas = 0;

                if ($chat) {
                    $ultima = $chat->mensagens()->latest('created_at')->first();
                    $ultimaMensagem = $ultima?->paraArray();

                    $naoLidas = $chat->mensagens()
                        ->where('usuario_id', '!=', $usuario->getAttribute('id'))
                        ->whereNull('visualizado_em')
                        ->count();
                }

                return [
                    'pedido_id' => $pedido->getAttribute('id'),
                    'pedido_status' => $pedido->getAttribute('status'),
                    'titulo' => $ladoEmpresa
                        ? ($pedido->cliente?->nome ?? $pedido->getAttribute('nome') ?? 'Cliente')
                        : ($pedido->empresa?->nome_fantasia ?? 'Loja'),
                    'ultima_mensagem' => $ultimaMensagem,
                    'nao_lidas' => $naoLidas,
                ];
            })
            ->values()
            ->all();
    }
}
