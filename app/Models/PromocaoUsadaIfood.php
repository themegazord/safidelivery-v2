<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\PatrocinioDescontoIfoodEnum;
use App\Enums\AlvoDescontoIfoodEnum;

class PromocaoUsadaIfood extends Model
{
  protected $table = 'promocao_usada_ifood';

  protected $fillable = [
    'pedido_id',
    'responsavel_desconto',
    'alvo_desconto',
    'valor',
    'alvo_id',
    'meta',
  ];

  protected $casts = [
    'responsavel_desconto' => PatrocinioDescontoIfoodEnum::class,
    'alvo_desconto' => AlvoDescontoIfoodEnum::class,
    'valor' => 'decimal:2',
    'meta' => 'array',
  ];

  public function pedido()
  {
    return $this->belongsTo(Pedido::class,'pedido_id');
  }
}
