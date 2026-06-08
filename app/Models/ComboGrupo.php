<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComboGrupo extends Model
{
    protected $table = 'combo_grupos';

    protected $fillable = ['combo_id', 'nome', 'qtd_maxima', 'ordem', 'configuracao'];

    protected $casts = ['configuracao' => 'array'];

    public function combo(): BelongsTo
    {
        return $this->belongsTo(Combo::class, 'combo_id');
    }

    public function entradas(): HasMany
    {
        return $this->hasMany(ComboEntrada::class, 'combo_grupo_id');
    }
}
