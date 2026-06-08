<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComboEntrada extends Model
{
    protected $table = 'combo_entradas';

    protected $fillable = ['combo_id', 'tipo', 'combo_grupo_id', 'grupo_complemento_id', 'referencia_id', 'nome_snapshot', 'preco_snapshot'];

    public function combo(): BelongsTo
    {
        return $this->belongsTo(Combo::class, 'combo_id');
    }

    public function comboGrupo(): BelongsTo
    {
        return $this->belongsTo(ComboGrupo::class, 'combo_grupo_id');
    }

    public function grupoComplemento(): BelongsTo
    {
        return $this->belongsTo(GrupoComplemento::class, 'grupo_complemento_id');
    }

    public function itemOriginal(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'referencia_id');
    }

    public function complementoOriginal(): BelongsTo
    {
        return $this->belongsTo(Complemento::class, 'referencia_id');
    }
}
