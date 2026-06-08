<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromocaoUsada extends Model
{
  protected $table = 'promocao_usada';
  protected $fillable = [
    'promocao_id',
    'cliente_id',
    'pedido_id'
  ];
}
