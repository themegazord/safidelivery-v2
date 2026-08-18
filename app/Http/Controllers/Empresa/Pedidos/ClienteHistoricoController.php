<?php

namespace App\Http\Controllers\Empresa\Pedidos;

use App\Actions\Pedidos\HistoricoPedidosClienteAction;
use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Empresa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClienteHistoricoController extends Controller
{
    public Empresa $empresa;

    public function __construct(Request $request)
    {
        $this->empresa = Empresa::query()->where('cnpj', $request->route('cnpj'))->firstOrFail();
    }

    public function show(Request $request, string $cnpj, int $cliente_id, HistoricoPedidosClienteAction $action): JsonResponse
    {
        $cliente = Cliente::findOrFail($cliente_id);
        $porPagina = (int) $request->input('por_pagina', 10);

        return response()->json($action->handle($this->empresa, $cliente, $porPagina));
    }
}
