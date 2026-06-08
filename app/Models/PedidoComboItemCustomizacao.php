<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PedidoComboItemCustomizacao extends Model
{
    protected $table = 'pedido_combo_item_customizacoes';

    protected $fillable = ['pedido_combo_item_id', 'uuid', 'external_id', 'grupo_nome', 'nome', 'preco_unitario', 'qtde'];

    public function comboItem(): BelongsTo
    {
        return $this->belongsTo(PedidoComboItem::class, 'pedido_combo_item_id');
    }
}
