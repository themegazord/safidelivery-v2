<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Configuracao extends Model
{
  protected $fillable = ['empresa_id', 'configuracao', 'valor'];

  protected $table = 'configuracoes';

  public function empresa(): BelongsTo {
    return $this->belongsTo(Empresa::class);
  }
}
