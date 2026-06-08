<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Cardapio extends Model
{
  /** @use HasFactory<\Database\Factories\CardapioFactory> */
  use HasFactory;

  protected $fillable = [
    'tipo_importacao',
    'empresa_id',
    'nome',
    'descricao',
    'dias_funcionamento',
    'tipo_funcionamento'
  ];

  protected $casts = [
    'dias_funcionamento' => 'array',
  ];

  public function empresa(): BelongsTo {
    return $this->belongsTo(Empresa::class, 'empresa_id');
  }

  public function categorias(): HasMany {
    return $this->hasMany(Categoria::class,'cardapio_id');
  }


  public function importacaoIfood(): HasOne {
    return $this->hasOne(ImportacaoCardapioIfood::class, 'cardapio_id');
  }
}
