<?php

namespace App\Actions\Chat;

use App\Models\Chat;
use App\Models\Mensagem;
use App\Models\Pedido;
use App\Models\User;

class BuscaMensagensAction
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function handle(Pedido $pedido, User $usuario): array
    {
        $chat = Chat::query()->firstOrCreate(['pedido_id' => $pedido->getAttribute('id')]);

        Mensagem::query()
            ->where('chat_id', $chat->getAttribute('id'))
            ->where('usuario_id', '!=', $usuario->getAttribute('id'))
            ->whereNull('visualizado_em')
            ->update(['visualizado_em' => now()]);

        return $chat->mensagens()
            ->with('usuario:id,name')
            ->orderBy('created_at')
            ->get()
            ->map(fn (Mensagem $mensagem) => $mensagem->paraArray())
            ->values()
            ->all();
    }
}
