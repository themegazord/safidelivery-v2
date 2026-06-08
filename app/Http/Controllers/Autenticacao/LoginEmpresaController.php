<?php

namespace App\Http\Controllers\Autenticacao;

use App\Http\Controllers\Controller;
use App\Http\Requests\Autenticacao\LoginEmpresaRequest;
use App\Models\Empresa;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginEmpresaController extends Controller
{
    public function index()
    {
        return Inertia::render('Autenticacao/LoginEmpresa');
    }

    public function store(LoginEmpresaRequest $request)
    {
        if (!Auth::attempt($request->only(['email', 'password']))) {
            return back()->withErrors([
                'email' => 'Credenciais inválidas.'
            ]);
        }

        $empresa = Empresa::where('email', $request->input('email'))->first();

        return Inertia::location(route('aplicacao.empresa.desempenho', ['cnpj' => $empresa->getAttribute('cnpj')]));
    }
}
