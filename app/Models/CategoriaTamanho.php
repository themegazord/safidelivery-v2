<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoriaTamanho extends Model
{
  /** @use HasFactory<\Database\Factories\CategoriaTamanhoFactory> */
  use HasFactory;

  protected $table = 'categoria_tamanho';

  protected $fillable = [
    'external_id',
    'categoria_id',
    'nome',
    'qtde_pedacos',
    'qtde_sabores'
  ];

  protected $casts = [
    'qtde_sabores' => 'array'
  ];

  public function categoria(): BelongsTo {
    return $this->belongsTo(Categoria::class, 'categoria_id')->withTrashed();
  }

  public function precosPorTamanho(): HasMany {
    return $this->hasMany(ItemPreco::class, 'tamanho_id');
  }
}
