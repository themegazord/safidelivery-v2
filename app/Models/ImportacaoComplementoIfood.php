<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportacaoComplementoIfood extends Model
{
  protected $table = "importacao_complemento_ifood";

  protected $fillable = [
    'complemento_id',
    'option_id',
    'product_id'
  ];

  public function complemento(): BelongsTo {
    return $this->belongsTo(Complemento::class);
  }
}
