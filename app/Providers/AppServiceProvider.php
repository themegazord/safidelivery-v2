<?php

namespace App\Providers;

use App\Models\Pedido;
use App\Observers\PedidoObserver;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Pedido::observe(PedidoObserver::class);

        // O app não usa a rota nomeada "password.reset" padrão do Laravel — aponta pra
        // página Inertia própria em vez do link genérico que o framework montaria.
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            return route('aplicacao.autenticacao.empresa.redefinir-senha', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);
        });

        if ($this->app->isProduction()) {
            URL::forceScheme('https');

            // Não força via config/session.php: chamar app()->environment() na leitura da config
            // quebra comandos que carregam a config antes do container estar pronto (ex: package:discover).
            // Lido via config() (não env()) para continuar seguro com config:cache em produção.
            if (is_null(config('session.secure'))) {
                Config::set('session.secure', true);
            }
        }
    }
}
