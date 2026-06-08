<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemPreco extends Model
{
  /** @use HasFactory<\Database\Factories\ItemPrecoFactory> */
  use HasFactory;

  protected $table = 'item_preco';

  protected $fillable = [
    'item_id',
    'tamanho_id',
    'status',
    'preco',
    'classificacao',
    'dias_funcionamento',
  ];

  protected $casts = [
    'classificacao' => 'array',
    'dias_funcionamento' => 'array',
  ];

  public function tamanho(): BelongsTo {
    return $this->belongsTo(CategoriaTamanho::class, 'tamanho_id');
  }

  public function item(): BelongsTo {
    return $this->belongsTo(Item::class, 'item_id');
  }
}
