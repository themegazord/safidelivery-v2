<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;

class Mesa extends Model
{
  protected $fillable = [
    'empresa_id',
    'mesa',
    'link_gerado'
  ];

  public function empresa(): BelongsTo
  {
    return $this->belongsTo(Empresa::class);
  }

  public function pedidosAbertosDaMesa(): ?Collection {
    return Pedido::whereMesa($this->mesa)->where('status', '!=', 'finalizado')->get();
  }

  public function pedidosTotaisDaMesa(): ?Collection {
    return Pedido::whereMesa($this->mesa)->where('status', '!=', 'finalizado')->withTrashed()->get();
  }

  public function pedidosCanceladosDaMesa(): ?Collection {
    return Pedido::whereMesa($this->mesa)->where('status', '!=', 'finalizado')->onlyTrashed()->get();
  }

  public function totalPedidoCanceladosDaMesa(): float|int|null {
    return $this->pedidosCanceladosDaMesa()->sum(fn ($p) => $p->financeiro->total);
  }
}
