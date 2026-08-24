<?php

namespace App\Http\Controllers\Autenticacao;

use App\Http\Requests\Autenticacao\ConsultaDadosClienteRequest;
use App\Http\Requests\Autenticacao\LoginClienteRequest;
use App\Http\Resources\ClienteResource;
use App\Models\Empresa;
use App\Services\Autenticacao\LoginClienteService;
use App\Traits\ResolveComandaAtual;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class LoginClienteController
{
    use ResolveComandaAtual;

    public function __construct(private readonly LoginClienteService $service) {}

    public function consultaDadosCliente(ConsultaDadosClienteRequest $request): JsonResponse
    {
        $cliente = $this->service->consultaDadosCliente($request->validated('telefone'));

        return response()->json(['cliente' => $cliente ? new ClienteResource($cliente) : null]);
    }

    public function autenticaCliente(LoginClienteRequest $request): RedirectResponse
    {
        $dados = $request->validated();

        $usuario = $this->service->autenticaCliente(
            $dados['telefone'],
            $dados['nome'],
            $dados['tipo_funcionamento'],
            $dados['modo_atendente'],
        );

        $this->resolveComandaAtual($dados['telefone'], Empresa::query()->where('interacao_id', $dados['interacao_id'])->first()->getAttribute('id'), [
            'modo_atendente' => $dados['modo_atendente'],
            'informa_mesa_comanda' => $dados['informa_mesa_comanda'],
        ]);

        return to_route('aplicacao.empresa.finalizar-pedido');
    }
}
