<?php

namespace App\Models;

use App\Enums\ModoRetiradaEnum;
use App\Enums\TipoAreaColetaEnum;
use App\Enums\TipoLugarRetiradaEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DadosRetiradaPedido extends Model
{
  protected $fillable = [
    'pedido_ifood_id',
    'mode',
    'takeout_datetime',
    'location_type',
    'pickup_area_code',
    'pickup_area_type',
    'pickup_area_assigned_at',
    'meta',
  ];

  protected $casts = [
    'mode' => ModoRetiradaEnum::class,
    'location_type' => TipoLugarRetiradaEnum::class,
    'pickup_area_type' => TipoAreaColetaEnum::class,
    'takeout_datetime' => 'datetime',
    'pickup_area_assigned_at' => 'datetime',
    'meta' => 'array',
  ];

  public function pedido(): BelongsTo
  {
    return $this->belongsTo(Pedido::class, 'pedido_ifood_id', 'pedido_ifood_id');
  }
}
