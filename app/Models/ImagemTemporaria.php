<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImagemTemporaria extends Model
{
  protected $table = 'imagens_temporarias';
  protected $fillable = [
    'bucket_key',
    'url',
    'item_id',
  ];

  public function item(): BelongsTo
  {
    return $this->belongsTo(Item::class, 'item_id');
  }
}
