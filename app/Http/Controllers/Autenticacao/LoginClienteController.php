<?php

namespace App\Http\Controllers\Autenticacao;

use App\Http\Requests\Autenticacao\LoginClienteRequest;
use App\Services\Autenticacao\LoginClienteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoginClienteController
{
    public function __construct(private readonly LoginClienteService $service) {}

    public function consultaDadosCliente(Request $request): JsonResponse
    {
        $cliente = $this->service->consultaDadosCliente($request->input('telefone'));

        return response()->json(['cliente' => $cliente]);
    }

    public function autenticaCliente(LoginClienteRequest $request): JsonResponse
    {
        $dados = $request->validated();

        $usuario = $this->service->autenticaCliente(
            $dados['telefone'],
            $dados['nome'],
            $dados['tipo_funcionamento'],
            $dados['modo_atendente'],
        );

        return response()->json(['usuario' => $usuario]);
    }
}
