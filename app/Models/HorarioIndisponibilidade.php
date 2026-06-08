<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HorarioIndisponibilidade extends Model
{
  protected $table = 'horario_indisponibilidade';

  protected $fillable = [
    'empresa_id',
    'titulo',
    'descricao',
    'data_inicio',
    'data_fim'
  ];

  public function empresa(): BelongsTo {
    return $this->belongsTo(Empresa::class);
  }
}
