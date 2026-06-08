<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Integracao extends Model
{
  protected $table = 'integracoes';

  protected $fillable = ['id', 'empresa_id', 'tipo', 'chavesecreta_pagarme', 'companyToken', 'clientId', 'clientSecret', 'merchantId'];

  public function empresa(): BelongsTo {
    return $this->belongsTo(Empresa::class, 'empresa_id');
  }
}
