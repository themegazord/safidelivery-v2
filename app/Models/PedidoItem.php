<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PedidoItem extends Model
{
  protected $table = 'pedido_itens';

  protected $fillable = ['pedido_id', 'item_id', 'external_id', 'uuid', 'tamanho_id', 'borda_id', 'massa_id', 'preco_borda', 'preco_massa', 'nome', 'quantidade', 'preco_unitario', 'subtotal', 'tipo', 'tipo_preco', 'observacao', 'item_premio', 'preco_original'];

  public function pedido()
  {
    return $this->belongsTo(Pedido::class);
  }

  public function complementos()
  {
    return $this->hasMany(PedidoComplemento::class);
  }

  public function sabores()
  {
    return $this->hasMany(PedidoSaborPizza::class);
  }

  public function item(): BelongsTo {
    return $this->belongsTo(Item::class, 'item_id');
  }

  public function tamanho(): BelongsTo {
    return $this->belongsTo(CategoriaTamanho::class, 'tamanho_id');
  }

  public function borda(): BelongsTo {
    return $this->belongsTo(CategoriaBorda::class, 'borda_id');
  }

  public function massa(): BelongsTo {
    return $this->belongsTo(CategoriaMassa::class, 'massa_id');
  }

  public function comboItens()
  {
    return $this->hasMany(PedidoComboItem::class, 'pedido_item_id');
  }
}
