<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportacaoGrupoComplementoIfood extends Model
{
  protected $table = 'importacao_grupo_complemento_ifood';

  protected $fillable = [
    'grupo_id',
    'option_group_id'
  ];

  public function grupoComplemento(): BelongsTo {
    return $this->belongsTo(GrupoComplemento::class, 'grupo_id');
  }
}
