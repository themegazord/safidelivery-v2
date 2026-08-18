<?php

namespace App\Http\Controllers\Cliente;

use App\Actions\Cliente\ResumoCashbackClienteAction;
use App\Actions\Cliente\ResumoFidelidadeClienteAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\Pedidos\PedidoResource;
use App\Models\Pedido;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MeusPedidosController extends Controller
{
    private const QTD_PEDIDOS = 20;

    public function index(): Response|RedirectResponse
    {
        if (! Auth::check() || ! Auth::user()->cliente) {
            return to_route('aplicacao.home');
        }

        $clienteId = Auth::user()->cliente->id;

        $pedidos = Pedido::where('cliente_id', $clienteId)
            ->with(['itens', 'financeiro', 'cashback', 'empresa'])
            ->orderByDesc('created_at')
            ->take(self::QTD_PEDIDOS)
            ->get();

        return Inertia::render('Cliente/MeusPedidos', [
            'pedidos' => PedidoResource::collection($pedidos)->resolve(),
            'cashbackResumo' => (new ResumoCashbackClienteAction())->handle($clienteId),
            'fidelidadeResumo' => (new ResumoFidelidadeClienteAction())->handle($clienteId),
        ]);
    }
}
