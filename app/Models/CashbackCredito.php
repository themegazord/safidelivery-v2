<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashbackCredito extends Model
{
	protected $fillable = [
		'empresa_id',
		'cliente_id',
		'pedido_id',
		'credito_gerado',
		'saldo_restante',
		'data_gerado',
		'data_vencimento',
		'usado_em',
	];

	protected $casts = [
		'data_vencimento' => 'datetime',
		'usado_em' => 'datetime',
	];

	public function empresa(): BelongsTo {
		return $this->belongsTo(Empresa::class);
	}

	public function cliente(): BelongsTo {
		return $this->belongsTo(Cliente::class);
	}

	public function pedido(): BelongsTo {
		return $this->belongsTo(Pedido::class);
	}
}
