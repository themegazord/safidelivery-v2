<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JustificativaCancelamentoPedido extends Model
{
  protected $fillable = ['pedido_id', 'origem_cancelamento', 'motivo'];
  protected $table = 'justificativa_cancelamento_pedidos';
  public function pedido(): BelongsTo {
    return $this->belongsTo(Pedido::class, 'pedido_id');
  }
}
