<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificacao extends Model
{
  use HasFactory;

  protected $table = 'notificacoes';

  protected $fillable = [
    'empresa_id',
    'tipo',
    'titulo',
    'mensagem',
    'data',
    'lida',
    'lida_em',
  ];

  protected $casts = [
    'data' => 'array',
    'lida' => 'boolean',
    'lida_em' => 'datetime',
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
  ];

  // Relacionamentos
  public function empresa(): BelongsTo
  {
    return $this->belongsTo(Empresa::class);
  }

  // cria o "campo" virtual pedido_ifood_id a partir do JSON
  protected function pedidoIfoodId(): Attribute
  {
    return Attribute::make(
      get: fn () => data_get($this->data, 'pedido_ifood_id'),
      set: fn ($value) => $this->data = array_replace($this->data ?? [], ['pedido_ifood_id' => $value]),
    );
  }

  public function pedido(): BelongsTo
  {
    // foreignKey = atributo "virtual" deste model
    // ownerKey   = coluna (ou atributo) no model Pedido
    return $this->belongsTo(Pedido::class, 'pedido_ifood_id', 'pedido_ifood_id');
  }

  // Escopos úteis
  public function scopeDaEmpresa(Builder $query, int $empresa_id): Builder
  {
    return $query->where('empresa_id', $empresa_id);
  }

  public function scopeNaoLidas(string $empresa_id): Builder
  {
    return $this->where('empresa_id', $empresa_id)->where('lida', false);
  }

  public function scopePorTipo(Builder $query, string $tipo): Builder
  {
    return $query->where('tipo', $tipo);
  }

  // Helpers
  public function marcarComoLida(): void
  {
    if (!$this->lida) {
      $this->forceFill([
        'lida' => true,
        'lida_em' => now(),
      ])->save();
    }
  }

}
