<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PedidoSaborPizza extends Model
{
  protected $table = 'pedido_sabores_pizza';

  protected $fillable = ['pedido_item_id', 'sabor_id', 'uuid', 'nome', 'descricao', 'preco_unitario', 'qtde', 'qtde_fracionada'];

  protected $casts = [
    'qtde_fracionada' => 'float'
  ];

  public function item()
  {
    return $this->belongsTo(PedidoItem::class, 'pedido_item_id');
  }

  public function sabor(): BelongsTo {
    return $this->belongsTo(Item::class, 'sabor_id');
  }
}
