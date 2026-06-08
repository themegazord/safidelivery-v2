<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Combo extends Model
{
    use SoftDeletes;

    protected $table = 'itens';

    protected $fillable = ['categoria_id', 'tipo', 'nome', 'external_id', 'descricao', 'preco', 'tipo_preco', 'imagem', 'classificacao', 'dias_funcionamento'];

    protected $casts = ['classificacao' => 'array', 'dias_funcionamento' => 'array'];

    protected static function booted(): void
    {
        static::addGlobalScope('combo', fn (Builder $q) => $q->where('tipo', 'CON'));
        static::creating(fn ($m) => $m->tipo = 'CON');
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    public function meta(): HasOne
    {
        return $this->hasOne(ComboMeta::class, 'combo_id');
    }

    public function grupos(): HasMany
    {
        return $this->hasMany(ComboGrupo::class, 'combo_id');
    }

    public function entradas(): HasMany
    {
        return $this->hasMany(ComboEntrada::class, 'combo_id');
    }

    public function entradasItens(): HasMany
    {
        return $this->hasMany(ComboEntrada::class, 'combo_id')->where('tipo', 'item');
    }

    public function entradasComplementos(): HasMany
    {
        return $this->hasMany(ComboEntrada::class, 'combo_id')->where('tipo', 'complemento');
    }
}
