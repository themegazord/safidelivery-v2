<?php

namespace App\Enums;

enum ModoCalculoFrete:int
{
  case TEMPO_ENTREGA_GOOGLE = 1;
  case TEMPO_ENTREGA_GOOGLE_PREPARO = 2;
  case TEMPO_ENTREGA_CONFIG = 3;
  case TEMPO_ENTREGA_CONFIG_PREPARO = 4;

  public function descricao(): string
  {
    return match ($this) {
      self::TEMPO_ENTREGA_GOOGLE => 'Por tempo de entrega (Google Maps)',
      self::TEMPO_ENTREGA_GOOGLE_PREPARO => 'Por tempo de entrega (Google Maps) + tempo de preparo',
      self::TEMPO_ENTREGA_CONFIG => 'Por tempo de entrega configurado (taxas por raio)',
      self::TEMPO_ENTREGA_CONFIG_PREPARO => 'Por tempo de entrega configurado + tempo de preparo',
    };
  }

  public function calculoBaseadoNaOpcao(int $tempoGoogle, int $tempoConfig, int $tempoPreparo): float {
    return match ($this) {
      self::TEMPO_ENTREGA_GOOGLE => $tempoGoogle,
      self::TEMPO_ENTREGA_GOOGLE_PREPARO => $tempoGoogle + $tempoPreparo,
      self::TEMPO_ENTREGA_CONFIG => $tempoConfig,
      self::TEMPO_ENTREGA_CONFIG_PREPARO => $tempoConfig + $tempoPreparo
    };
  }
}
