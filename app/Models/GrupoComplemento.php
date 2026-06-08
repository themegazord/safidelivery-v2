<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class GrupoComplemento extends Model
{
  /** @use HasFactory<\Database\Factories\GrupoComplementoFactory> */
  use HasFactory, SoftDeletes;

  protected $table = 'grupo_complemento';

  protected $fillable = [
    'item_id',
    'nome',
    'obrigatoriedade',
    'qtd_minima',
    'qtd_maxima',
  ];

  public function item(): BelongsTo {
    return $this->belongsTo(Item::class, 'item_id');
  }

  public function complementos(): HasMany {
    return $this->hasMany(Complemento::class,'grupo_id');
  }

  public function grupoComplementoIfood(): HasOne {
    return $this->hasOne(ImportacaoGrupoComplementoIfood::class, 'grupo_id');
  }
}
