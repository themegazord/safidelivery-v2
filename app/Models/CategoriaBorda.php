<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoriaBorda extends Model
{
  /** @use HasFactory<\Database\Factories\CategoriaBordaFactory> */
  use HasFactory;

  protected $table = 'categoria_borda';

  protected $fillable = [
    'external_id',
    'categoria_id',
    'nome',
    'preco'
  ];

  public function categoria(): BelongsTo {
    return $this->belongsTo(Categoria::class, 'categoria_id')->withTrashed();
  }
}
