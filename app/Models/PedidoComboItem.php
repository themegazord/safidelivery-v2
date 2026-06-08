<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PedidoComboItem extends Model
{
    protected $table = 'pedido_combo_itens';

    protected $fillable = ['pedido_item_id', 'uuid', 'external_id', 'referencia_id', 'tipo', 'grupo_nome', 'item_nome', 'preco_unitario', 'qtde'];

    public function pedidoItem(): BelongsTo
    {
        return $this->belongsTo(PedidoItem::class, 'pedido_item_id');
    }

    public function customizacoes(): HasMany
    {
        return $this->hasMany(PedidoComboItemCustomizacao::class, 'pedido_combo_item_id');
    }
}
