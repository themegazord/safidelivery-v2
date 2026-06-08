<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class FinanceiroPedido extends Model
{
    protected $table = 'financeiro_pedido';
    protected $primaryKey = 'uuid';
    public $incrementing = false;
    protected $keyType = 'string';
  protected $fillable = [
    "uuid",
    "pedido_id",
    "forma_pagamento",
    "forma_pagamento_id",
    "adicional",
    "subtotal_itens",
    "subtotal_itens_ifood",
    "total",
		"valor_desconto",
    "cashback_utilizado",
    "troco_para",
    "valor_troco",
  ];

  public function pedido(): BelongsTo
  {
    return $this->belongsTo(Pedido::class, 'id', 'pedido_id');
  }

  public function formaPagamento(): BelongsTo
  {
    return $this->belongsTo(FormaPagamento::class)->withTrashed();
  }

  public function status_financeiro_api(): HasOne {
    return $this->hasOne(StatusFinanceiroPedidoApi::class, 'financeiro_pedido_id', 'uuid');
  }

  public function pagamentos(): HasMany {
    return $this->hasMany(FinanceiroPedidoPagamento::class, 'financeiro_pedido_uuid', 'uuid');
  }

  public function defineFormaPagamento(): string
  {
    if ($this->forma_pagamento_id && $this->formaPagamento) {
      return $this->formaPagamento->descricao;
    }

    $forma = $this->forma_pagamento;

    if (is_null($forma)) {
      return 'Não informado';
    }

    // Valor numérico: codigo_pdv salvo antes da migração para tipo
    if (is_numeric($forma)) {
      return FormaPagamento::withTrashed()
        ->where('codigo_pdv', $forma)
        ->value('descricao') ?? 'Forma de pagamento não definida';
    }

    return match ($forma) {
      'pix', 'PIX' => 'Pix',
      'master_debito' => 'Master Débito',
      'visa_debito' => 'Visa Débito',
      'elo_debito' => 'Elo Débito',
      'CTD' => 'Cartão de Débito',
      'visa_credito' => 'Visa Crédito',
      'elo_credito' => 'Elo Crédito',
      'amex_credito' => 'Amex Crédito',
      'master_credito' => 'Master Crédito',
      'CTC' => 'Cartão de Crédito',
      'dinheiro', 'DIN' => 'Dinheiro',
      'vr_refeicao', 'alelo_refeicao', 'outro_refeicao', 'VRE' => 'Vale Refeição',
      'cashback', 'VIR' => 'Cashback',
      'multiplo' => 'Múltiplas formas',
      default => FormaPagamento::tipoLabel($forma),
    };
  }

}
