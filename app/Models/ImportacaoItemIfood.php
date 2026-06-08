<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportacaoItemIfood extends Model
{
  protected $table = 'importacao_item_ifood';

  protected $fillable = [
    'item_id',
    'item_ifood_id',
    'product_id'
  ];

  public function item(): BelongsTo {
    return $this->belongsTo(Item::class);
  }
}
