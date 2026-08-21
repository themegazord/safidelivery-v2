<?php

namespace App\Http\Controllers\Cliente;

use App\Actions\Chat\BuscaMensagensAction;
use App\Actions\Chat\EnviaMensagemAction;
use App\Actions\Chat\ListaConversasAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Chat\EnviaMensagemRequest;
use App\Models\Pedido;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    private function clienteIdAutenticado(): ?int
    {
        if (! Auth::check() || ! Auth::user()->cliente) {
            return null;
        }

        return Auth::user()->cliente->id;
    }

    public function conversas(ListaConversasAction $action): JsonResponse
    {
        $clienteId = $this->clienteIdAutenticado();

        if (! $clienteId) {
            return response()->json(['conversas' => []]);
        }

        // Sem filtro por status: o chat de um pedido concluído/cancelado continua acessível —
        // é justamente ali que costuma surgir reclamação ou dúvida sobre o que já aconteceu.
        $pedidos = Pedido::query()
            ->where('cliente_id', $clienteId)
            ->with(['empresa'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'conversas' => $action->handle($pedidos, Auth::user(), ladoEmpresa: false),
        ]);
    }

    public function mensagens(BuscaMensagensAction $action, int $pedido_id): JsonResponse
    {
        $clienteId = $this->clienteIdAutenticado();

        if (! $clienteId) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        $pedido = Pedido::query()->where('cliente_id', $clienteId)->findOrFail($pedido_id);

        return response()->json(['mensagens' => $action->handle($pedido, Auth::user())]);
    }

    public function enviarMensagem(EnviaMensagemRequest $request, EnviaMensagemAction $action, int $pedido_id): JsonResponse
    {
        $clienteId = $this->clienteIdAutenticado();

        if (! $clienteId) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        $pedido = Pedido::query()->where('cliente_id', $clienteId)->findOrFail($pedido_id);

        $mensagem = $action->handle($pedido, Auth::user(), $request->validated()['mensagem']);

        return response()->json(['mensagem' => $mensagem->paraArray()]);
    }
}
