<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirecionarLoginEspecifico
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            // Verificar o prefixo da rota para determinar o tipo de login
            $routeName = $request->route()->getName();

            if (str_contains($routeName, 'empresa')) {
                return redirect()->route('aplicacao.autenticacao.empresa.login');
            }
        }

        return $next($request);
    }
}
