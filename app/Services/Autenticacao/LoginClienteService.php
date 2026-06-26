<?php

namespace App\Services\Autenticacao;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class LoginClienteService
{
    public function consultaDadosCliente(string $telefone): Cliente|null
    {
        $telefoneLimpo = $this->limpaTelefone($telefone);

        return Cliente::query()
            ->where('telefone', $telefoneLimpo)
            ->first(['id', 'nome', 'telefone']);
    }

    public function autenticaCliente(string $telefone, string $nome, string $tipoFuncionamento, bool $modoAtendente): User|null
    {
        if ($tipoFuncionamento === 'mesa' && $modoAtendente) {
            session('telefone_cliente_modoatendente', $telefone);
            session('nome_cliente_modoatendente', $telefone);
            return null;
        }

        $cliente = $this->retornaOuCriaClientePeloTelefone($telefone, $nome);

        $usuario = $cliente->usuario;

        if (!$usuario) {
            $usuario = User::query()->create(['name' => $nome]);

            $cliente->update(['user_id' => $usuario->getAttribute('id')]);
        }

        Auth::login($usuario);

        $usuario->load('cliente.enderecos');

        return $usuario;
    }

    private function retornaOuCriaClientePeloTelefone(string $telefone, string $nome): Cliente
    {
        $telefoneLimpo = $this->limpaTelefone($telefone);

        return Cliente::query()->firstOrCreate(
            ['telefone' => $telefoneLimpo],
            ['nome' => $nome]
        );
    }

    private function limpaTelefone(string $telefoneSujo): string
    {
        return preg_replace('/\D/', '', $telefoneSujo);
    }
}
