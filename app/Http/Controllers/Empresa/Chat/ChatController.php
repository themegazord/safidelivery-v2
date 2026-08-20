<?php

namespace App\Http\Controllers\Empresa\Chat;

use App\Actions\Chat\BuscaMensagensAction;
use App\Actions\Chat\EnviaMensagemAction;
use App\Actions\Chat\ListaConversasAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Chat\EnviaMensagemRequest;
use App\Models\Empresa;
use App\Models\Pedido;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public Empresa $empresa;

    public function __construct()
    {
        $this->empresa = Empresa::where('cnpj', request('cnpj'))->firstOrFail();
    }

    public function conversas(ListaConversasAction $action): JsonResponse
    {
        $pedidos = Pedido::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->whereNotIn('status', [...Pedido::STATUS_FINALIZADOS_SUCESSO, ...Pedido::STATUS_CANCELADOS])
            ->with(['cliente'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'conversas' => $action->handle($pedidos, Auth::user(), ladoEmpresa: true),
        ]);
    }

    public function mensagens(string $cnpj, int $pedido_id, BuscaMensagensAction $action): JsonResponse
    {
        $pedido = Pedido::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->findOrFail($pedido_id);

        return response()->json(['mensagens' => $action->handle($pedido, Auth::user())]);
    }

    public function enviarMensagem(EnviaMensagemRequest $request, string $cnpj, int $pedido_id, EnviaMensagemAction $action): JsonResponse
    {
        $pedido = Pedido::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->findOrFail($pedido_id);

        $mensagem = $action->handle($pedido, Auth::user(), $request->validated()['mensagem']);

        return response()->json(['mensagem' => $mensagem->paraArray()]);
    }
}
