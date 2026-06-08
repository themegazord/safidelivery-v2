<?php

namespace App\Enums;

enum StatusSettlementEnum: string {
  case EXPIRED = 'EXPIRED';
  case ACCEPTED = 'ACCEPTED';
  case REJECTED = 'REJECTED';
  case ALTERNATIVE_REPLIED = 'ALTERNATIVE_REPLIED';

  public function label(): string {
    return match($this) {
      self::EXPIRED => 'Tempo expirado',
      self::ACCEPTED => 'Negociação aceita',
      self::REJECTED => 'Negociação rejeitada',
      self::ALTERNATIVE_REPLIED => 'Negociação respondida'
    };
  }

  public function color(): string {
    return match($this) {
      self::EXPIRED => 'text-error',
      self::ACCEPTED => 'text-primary',
      self::REJECTED => 'text-error',
      self::ALTERNATIVE_REPLIED => 'text-info'
    };
  }
}
