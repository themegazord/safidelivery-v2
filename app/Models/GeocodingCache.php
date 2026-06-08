<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeocodingCache extends Model
{
  protected $fillable = [
    'endereco_formatado',
    'endereco_formatado_google',
    'hash_endereco',
    'latitude',
    'longitude'
  ];

  protected $casts = [
    'latitude' => 'decimal:7',
    'longitude' => 'decimal:7'
  ];
}
