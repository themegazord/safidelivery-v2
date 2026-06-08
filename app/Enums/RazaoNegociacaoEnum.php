<?php

namespace App\Enums;

enum RazaoNegociacaoEnum: string
{
  case HIGH_STORE_DEMAND = 'HIGH_STORE_DEMAND';
  case STORE_SYSTEM_ISSUES = 'STORE_SYSTEM_ISSUES';
  case LACK_OF_DRIVERS = 'LACK_OF_DRIVERS';
  case OPERATIONAL_ISSUES = 'OPERATIONAL_ISSUES';
  case ORDER_OUT_FOR_DELIVERY = 'ORDER_OUT_FOR_DELIVERY';
  case DRIVER_IS_ALREADY_AT_THE_ADDRESS = 'DRIVER_IS_ALREADY_AT_THE_ADDRESS';
  case STORE_INTERNAL_DIFFICULTIES = 'STORE_INTERNAL_DIFFICULTIES';
  case OTHER_REASONS = 'OTHER_REASONS';

  public function descricao(): string {
    return match($this) {
      self::HIGH_STORE_DEMAND => 'Alta demanda na loja.',
      self::STORE_SYSTEM_ISSUES => 'Problemas no sistema da loja.',
      self::LACK_OF_DRIVERS => 'Falta de entregadores.',
      self::OPERATIONAL_ISSUES => 'Problemas operacionais.',
      self::ORDER_OUT_FOR_DELIVERY => 'Pedido saiu para entrega.',
      self::DRIVER_IS_ALREADY_AT_THE_ADDRESS => 'Entregador já está no endereço.',
      self::STORE_INTERNAL_DIFFICULTIES => 'Problemas internos da loja.',
      self::OTHER_REASONS => 'Outros motivos.',
    };
  }
}
