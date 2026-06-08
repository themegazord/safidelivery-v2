<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportacaoCardapioIfood extends Model
{
  protected $table = 'importacao_cardapio_ifood';

  protected $fillable = [
    'cardapio_id',
    'catalogId',
    'context'
  ];

  public function cardapio(): BelongsTo {
    return $this->belongsTo(Cardapio::class, 'cardapio_id');
  }
}
