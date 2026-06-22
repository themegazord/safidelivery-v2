<?php

namespace App\Http\Controllers\Autenticacao;

use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoginClienteController
{
    public function consultaDadosCliente(Request $request): JsonResponse
    {
        $telefone = preg_replace('/\D/', '', $request->input('telefone'));
        $cliente = Cliente::query()->where('telefone', $telefone)->first(['id', 'nome', 'telefone']);
        return response()->json(['cliente' => $cliente]);
    }
}
