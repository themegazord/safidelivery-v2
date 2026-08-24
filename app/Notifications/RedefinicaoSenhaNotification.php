<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RedefinicaoSenhaNotification extends Notification
{
    public function __construct(private readonly string $token) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = route('aplicacao.autenticacao.empresa.redefinir-senha', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);

        $minutosExpiracao = (int) config('auth.passwords.users.expire', 60);

        return (new MailMessage)
            ->subject('Redefinição de senha - SAFI Delivery')
            ->greeting('Olá!')
            ->line('Recebemos uma solicitação para redefinir a senha da sua conta no SAFI Delivery.')
            ->action('Redefinir senha', $url)
            ->line("Este link expira em {$minutosExpiracao} minutos.")
            ->line('Se você não solicitou a redefinição de senha, nenhuma ação é necessária — sua senha continua a mesma.')
            ->salutation('Equipe SAFI Delivery');
    }
}
