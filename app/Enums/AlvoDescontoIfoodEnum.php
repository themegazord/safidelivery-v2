<?php

namespace App\Enums;

enum AlvoDescontoIfoodEnum: string
{
  case CART = 'CART';
  case DELIVERY_FEE = 'DELIVERY_FEE';
  case ITEM = 'ITEM';
  case PROGRESSIVE_DISCOUNT_ITEM = 'PROGRESSIVE_DISCOUNT_ITEM';

  public function descricao(): string
  {
    return match ($this) {
      self::CART => 'Desconto aplicado sobre o subtotal do carrinho (somatório dos itens).',
      self::DELIVERY_FEE => 'Desconto aplicado sobre a taxa de entrega.',
      self::ITEM => 'Desconto aplicado em um item específico do carrinho (targetId específico).',
      self::PROGRESSIVE_DISCOUNT_ITEM => 'Desconto progressivo em itens iguais do pedido, formando um combo.',
    };
  }

  public function exigeTargetId(): bool
  {
    return in_array($this, [self::ITEM, self::PROGRESSIVE_DISCOUNT_ITEM], true);
  }

  public function ehDescontoNoFrete(): bool {
    return $this === self::DELIVERY_FEE;
  }
}
