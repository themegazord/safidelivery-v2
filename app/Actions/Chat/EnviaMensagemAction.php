<?php

namespace App\Actions\Chat;

use App\Events\EnviaMensagemSobrePedido;
use App\Models\Chat;
use App\Models\Mensagem;
use App\Models\Pedido;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Throwable;

class EnviaMensagemAction
{
    public function handle(Pedido $pedido, User $usuario, string $texto): Mensagem
    {
        $chat = Chat::query()->firstOrCreate(['pedido_id' => $pedido->getAttribute('id')]);

        $mensagem = Mensagem::query()->create([
            'chat_id' => $chat->getAttribute('id'),
            'usuario_id' => $usuario->getAttribute('id'),
            'mensagem' => $texto,
        ]);

        // A mensagem já está salva; se o WebSocket estiver indisponível, o envio
        // não deve falhar — a outra parte só perde a atualização instantânea.
        try {
            event(new EnviaMensagemSobrePedido($mensagem, $pedido->getAttribute('id')));
        } catch (Throwable $exception) {
            Log::warning('Falha ao transmitir mensagem em tempo real', [
                'pedido_id' => $pedido->getAttribute('id'),
                'mensagem_uuid' => $mensagem->getAttribute('uuid'),
                'erro' => $exception->getMessage(),
            ]);
        }

        return $mensagem;
    }
}
