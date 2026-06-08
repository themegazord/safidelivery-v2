<?php

namespace App\Enums;

enum TipoNegociacaoEnum: string
{
  case AFTER_DELIVERY = 'AFTER_DELIVERY';
  case DELAY = 'DELAY';
  case PREPARATION_TIME = 'PREPARATION_TIME';
  case AFTER_DELIVERY_PARTIALLY = 'AFTER_DELIVERY_PARTIALLY';

  public function descricao(): string
  {
    return match ($this) {
      self::AFTER_DELIVERY => 'Solicitação de cancelamento após a entrega',
      self::DELAY => 'Solicitação de cancelamento por atraso na entrega',
      self::PREPARATION_TIME => 'Solicitação de cancelamento durante o preparo',
      self::AFTER_DELIVERY_PARTIALLY => 'Solicitação de cancelamento parcial após a entrega',
    };
  }
}
