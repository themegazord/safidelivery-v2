<?php

namespace App\Enums;

enum AcaoNegociacaoEnum:string
{
  case CANCELLATION = 'CANCELLATION';
  case PARTIAL_CANCELLATION = 'PARTIAL_CANCELLATION';
  case PROPOSED_AMOUNT_REFUND = 'PROPOSED_AMOUNT_REFUND';

  public function descricao(): string
  {
    return match ($this) {
      self::CANCELLATION => 'Cancelamento total',
      self::PARTIAL_CANCELLATION => 'Cancelamento parcial',
      self::PROPOSED_AMOUNT_REFUND => 'Cancelamento com proposta de reembolso',
    };
  }
}
