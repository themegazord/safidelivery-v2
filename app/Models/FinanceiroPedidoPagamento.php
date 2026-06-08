<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinanceiroPedidoPagamento extends Model
{
	protected $table = 'financeiro_pedido_pagamentos';

	protected $fillable = [
		'financeiro_pedido_uuid',
		'forma_pagamento',
		'forma_pagamento_id',
		'valor',
		'troco_para',
		'valor_troco',
	];

	public function financeiroPedido(): BelongsTo
	{
		return $this->belongsTo(FinanceiroPedido::class, 'financeiro_pedido_uuid', 'uuid');
	}

	public function formaPagamento(): BelongsTo
	{
		return $this->belongsTo(FormaPagamento::class)->withTrashed();
	}

	public function defineFormaPagamento(): string
	{
		if ($this->forma_pagamento_id && $this->formaPagamento) {
			return $this->formaPagamento->descricao;
		}

		$forma = $this->forma_pagamento;

		if (is_numeric($forma)) {
			$descricao = FormaPagamento::withTrashed()
				->where('codigo_pdv', $forma)
				->value('descricao');
			return $descricao ?? 'Forma de pagamento não definida';
		}

		$padrao = FormaPagamento::formasPagamentoPadrao();
		if (isset($padrao[$forma])) {
			return $padrao[$forma];
		}
		return FormaPagamento::tipoLabel($forma);
	}
}
