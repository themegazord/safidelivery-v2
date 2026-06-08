<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatusFinanceiroPedidoApi extends Model
{
  protected $table = 'status_financeiro_pedido_api';

  protected $fillable = [
    'order_id',
    'financeiro_pedido_id',
    'copia_cola_pix',
    'status',
    'url_qrcode_pix'
  ];

  public function financeiro_pedido(): BelongsTo {
    return $this->belongsTo(FinanceiroPedido::class, 'uuid', 'financeiro_pedido_id');
  }
}
