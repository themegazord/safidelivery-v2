<?php

namespace App\Events;

use App\Models\Mensagem;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EnviaMensagemSobrePedido implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Mensagem $mensagem,
        public int $pedidoId,
    ) {
        $this->mensagem->loadMissing('usuario');
    }

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('EnviaMensagemSobrePedido.' . $this->pedidoId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'EnviaMensagemSobrePedido';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'mensagem' => $this->mensagem->paraArray(),
            'pedido_id' => $this->pedidoId,
        ];
    }
}
