<?php

namespace App\Models;

use App\Enums\CashbackTipoEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashbackConfig extends Model
{
	protected $fillable = [
		'empresa_id',
		'cashback_porcentagem',
		'base_calculo_porcentagem',
		'cashback_fixo',
		'cashback_tipo',
		'dias_validade',
		'status',
		'tipos_funcionamento',
	];

	protected $casts = [
		'cashback_tipo' => CashbackTipoEnum::class,
		'tipos_funcionamento' => 'array',
	];

	public function getTiposFuncionamentoEfetivosAttribute(): array
	{
		return $this->tipos_funcionamento ?? ['delivery', 'retirada', 'mesa'];
	}

	public function empresa(): BelongsTo {
		return $this->belongsTo(Empresa::class);
	}
}
