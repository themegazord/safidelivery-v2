<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComboMeta extends Model
{
    protected $table = 'combos_meta';

    protected $fillable = ['combo_id', 'tipo_precificacao', 'preco_combo', 'desconto_combo'];

    public function combo(): BelongsTo
    {
        return $this->belongsTo(Combo::class, 'combo_id');
    }
}
