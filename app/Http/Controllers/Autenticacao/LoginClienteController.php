<?php

namespace App\Http\Controllers\Autenticacao;

use App\Http\Requests\Autenticacao\LoginClienteRequest;
use App\Models\Cliente;
use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class LoginClienteController
{
    public function consultaDadosCliente(Request $request): JsonResponse
    {
        $cliente = $this->retornaClientePeloTelefone($request->input('telefone'));
        return response()->json(['cliente' => $cliente]);
    }

    public function autenticaCliente(LoginClienteRequest $request): JsonResponse
    {
        $dados = $request->validated();
        $usuario = null;

        if ($dados['tipo_funcionamento'] !== 'mesa' || !$dados['modo_atendente']) {
            $cliente = $this->retornaClienteComUsuarioPeloTelefone($dados['telefone'], $dados['nome']);

            $usuario = $cliente->usuario;

            if (!$usuario) {
                $usuario = User::query()->with('cliente.enderecos')->create([
                    'name' => $dados['nome']
                ]);

                $cliente->update([
                    'user_id' => $usuario->getAttribute('id')
                ]);
            }

            Auth::login($usuario);
        }

        $usuario->load('cliente.enderecos');
        return response()->json(['usuario' => $usuario]);
    }

    private function retornaClientePeloTelefone(string $telefoneSujo): Cliente|null
    {
        $telefone = $this->limpaTelefone($telefoneSujo);
        $cliente = Cliente::query()->where('telefone', $telefone)->first(['id', 'nome', 'telefone']);
        return $cliente;
    }

    private function retornaClienteComUsuarioPeloTelefone(string $telefoneSujo, string $nome): Cliente
    {
        $telefone = $this->limpaTelefone($telefoneSujo);
        $cliente = Cliente::query()->firstOrCreate(
            ['telefone' => $telefone],
            ['nome' => $nome]
        );
        return $cliente;
    }

    private function limpaTelefone(string $telefoneSujo): string
    {
        return preg_replace('/\D/', '', $telefoneSujo);
    }
}
