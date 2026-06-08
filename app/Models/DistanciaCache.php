<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistanciaCache extends Model
{
  protected $fillable = [
    'hash_endereco_origem',
    'hash_endereco_entrega',
    'distancia_km',
    'duracao',
    'duracao_formatada'
  ];

  protected $casts = [
    'distancia_km' => 'decimal:2',
    'duracao' => 'integer'
  ];
}
