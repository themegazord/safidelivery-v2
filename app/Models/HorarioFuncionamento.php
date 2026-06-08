<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HorarioFuncionamento extends Model
{
  protected $table = 'horario_funcionamento';
  protected $fillable = [
    'empresa_id',
    'tipo_funcionamento',
    'dia_semana',
    'status',
    'hora_inicio',
    'hora_fim'
  ];

  public function empresa(): BelongsTo {
    return $this->belongsTo(Empresa::class);
  }
}
