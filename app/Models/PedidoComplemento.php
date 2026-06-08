<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PedidoComplemento extends Model
{
  protected $table = 'pedido_complementos';
  protected $fillable = ['pedido_item_id', 'complemento_id', 'external_id', 'uuid', 'nome', 'qtde', 'preco_unitario'];

  public function item()
  {
    return $this->belongsTo(PedidoItem::class, 'pedido_item_id');
  }

  public function complemento(): BelongsTo {
    return $this->belongsTo(Complemento::class, 'complemento_id');
  }
}
