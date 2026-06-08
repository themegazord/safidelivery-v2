<?php

namespace App\Enums;

enum PatrocinioDescontoIfoodEnum: string
{
  case IFOOD    = 'IFOOD';    // tratado como pagamento (repasse iFood)
  case EXTERNAL = 'EXTERNAL'; // tratado como pagamento (repasse parceiro externo)
  case MERCHANT = 'MERCHANT'; // tratado como desconto (subsídio da loja)
  case CHAIN    = 'CHAIN';    // tratado como desconto (subsídio da rede)

  public function descricao(): string
  {
    return match ($this) {
      self::IFOOD    => 'O valor do(s) cupom(ns) deve(m) ser tratado(s) como pagamento. Repasse pelo iFood.',
      self::EXTERNAL => 'O valor do(s) cupom(ns) deve(m) ser tratado(s) como pagamento. Repasse por parceiro externo.',
      self::MERCHANT => 'O valor do(s) cupom(ns) deve(m) ser tratado(s) como desconto. Subsídio da loja.',
      self::CHAIN    => 'O valor do(s) cupom(ns) deve(m) ser tratado(s) como desconto. Subsídio da rede.',
    };
  }

  public function ePagamento(): bool
  {
    return in_array($this, [self::IFOOD, self::EXTERNAL], true);
  }
}
