<?php

namespace App\Http\Controllers\Empresa\Pedidos;

use App\Actions\Pedidos\IndexTodosPedidosAction;
use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Models\Pedido;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TodosPedidosController extends Controller
{
    public Empresa $empresa;

    public function __construct(Request $request)
    {
        $this->empresa = Empresa::query()->where('cnpj', $request->route('cnpj'))->firstOrFail();
    }

    public function index(Request $request, IndexTodosPedidosAction $action)
    {
        $filtros = $request->only(['busca', 'data_inicio', 'data_fim', 'status', 'tipo', 'origem']);
        $filtros['data_inicio'] = $filtros['data_inicio'] ?? now()->subDays(7)->format('Y-m-d');
        $filtros['data_fim'] = $filtros['data_fim'] ?? now()->format('Y-m-d');

        $timezone = $this->empresa->resolveTimezone();
        $pedidos = $action->handle($this->empresa, $filtros);

        $pedidos->through(fn (Pedido $pedido) => [
            'id' => $pedido->id,
            'ifood_display_id' => $pedido->ifood_display_id,
            'pedido_ifood_id' => $pedido->pedido_ifood_id,
            'created_at' => $pedido->created_at->timezone($timezone)->toIso8601String(),
            'cliente_nome' => $pedido->cliente?->nome ?? $pedido->nome,
            'cliente_telefone' => $pedido->cliente?->telefone ?? $pedido->telefone,
            'tipo' => $pedido->tipo,
            'mesa' => $pedido->mesa,
            'status' => $pedido->status,
            'total' => $pedido->financeiro?->total ?? 0,
            'forma_pagamento_label' => $pedido->financeiro?->defineFormaPagamento() ?? 'N/A',
        ]);

        return Inertia::render('Empresa/Pedidos/TodosPedidos', [
            'pedidos' => $pedidos,
            'filtros' => $filtros,
            'timezone' => $timezone,
        ]);
    }

    public function cancelar(string $cnpj, int $pedido_id): JsonResponse
    {
        $pedido = Pedido::withTrashed()->where('empresa_id', $this->empresa->id)->findOrFail($pedido_id);

        if (in_array($pedido->status, ['pendente', 'sendo preparado', 'pronto para entrega'], true)) {
            $pedido->update(['status' => 'cancelado']);
        }

        return response()->json(['mensagem' => 'Pedido cancelado com sucesso!']);
    }

    public function confirmarEntrega(string $cnpj, int $pedido_id): JsonResponse
    {
        $pedido = Pedido::withTrashed()->where('empresa_id', $this->empresa->id)->findOrFail($pedido_id);

        if ($pedido->status !== 'cancelado') {
            $pedido->update(['status' => 'entregue']);
        }

        return response()->json(['mensagem' => 'Pedido marcado como entregue!']);
    }
}
