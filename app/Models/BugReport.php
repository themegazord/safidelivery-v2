<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BugReport extends Model
{
  protected $fillable = [
    'empresa_id',
    'gh_numero_issue',
    'gh_id_issue'
  ];

  public function empresa(): BelongsTo {
    return $this->belongsTo(Empresa::class);
  }
}
