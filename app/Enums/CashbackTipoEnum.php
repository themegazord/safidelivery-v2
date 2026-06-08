<?php

namespace App\Enums;

enum CashbackTipoEnum: string
{
    case PORCENTAGEM = 'porcentagem';
    case FIXO = 'fixo';

    public function descricao(): string
    {
        return match ($this) {
            self::PORCENTAGEM => 'Porcentagem (%)',
            self::FIXO => 'Valor fixo (R$)',
        };
    }
}
