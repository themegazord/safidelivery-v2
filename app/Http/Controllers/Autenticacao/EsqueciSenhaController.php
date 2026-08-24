<?php

namespace App\Http\Controllers\Autenticacao;

use App\Http\Controllers\Controller;
use App\Http\Requests\Autenticacao\EsqueciSenhaRequest;
use App\Http\Requests\Autenticacao\RedefineSenhaRequest;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class EsqueciSenhaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Autenticacao/EsqueciSenha');
    }

    public function envia(EsqueciSenhaRequest $request): RedirectResponse
    {
        try {
            Password::sendResetLink($request->only('email'));
        } catch (Throwable $e) {
            // Falha de envio (ex: SMTP fora do ar) não pode virar 500 pro usuário nem
            // denunciar se o e-mail existe — só registra pra alguém do time perceber.
            Log::error('Falha ao enviar e-mail de redefinição de senha', ['erro' => $e->getMessage()]);
        }

        // Mesma mensagem independente de o e-mail existir ou não na base — evita que o
        // formulário sirva como oráculo pra descobrir quais e-mails têm conta cadastrada.
        return back()->with('status', 'Se existir uma conta com esse e-mail, enviamos um link de redefinição de senha.');
    }

    public function formularioRedefinicao(string $token): Response
    {
        return Inertia::render('Autenticacao/RedefinirSenha', [
            'token' => $token,
            'email' => request()->query('email', ''),
        ]);
    }

    public function redefine(RedefineSenhaRequest $request): RedirectResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill(['password' => $password])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return back()->withErrors([
                'email' => 'Não foi possível redefinir a senha. O link pode ter expirado — solicite um novo.',
            ]);
        }

        return to_route('aplicacao.autenticacao.empresa.login')
            ->with('status', 'Senha redefinida com sucesso. Faça login com sua nova senha.');
    }
}
