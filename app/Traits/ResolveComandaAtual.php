<?php

namespace App\Traits;

use App\Models\Pedido;

trait ResolveComandaAtual
{
	public function resolveComandaAtual(?string $telefone, int $empresaId, array $configuracoes): void
	{
		$tipoFuncionamento = session()->get('tipo_funcionamento');

		if ($tipoFuncionamento !== 'mesa') {
			if (session()->get('comanda_atual') === null) {
				session()->put('comanda_atual', uuid_create());
			}

			return;
		}

		if ($configuracoes['informa_mesa_comanda'] ?? false) {
			return;
		}

		if (session()->get('comanda_atual') !== null) {
			return;
		}

		if (! empty($telefone)) {
			$telefoneClean = preg_replace('/\D/', '', $telefone);

			$comandaAtiva = Pedido::query()
				->where('empresa_id', $empresaId)
				->where('tipo', 'M')
				->whereNotNull('comanda')
				->whereRaw("comanda REGEXP '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'")
				->where(function ($query) use ($telefoneClean) {
					$query->where('telefone', $telefoneClean)
						->orWhereHas('cliente', function ($q) use ($telefoneClean) {
							$q->where('telefone', $telefoneClean);
						});
				})
				->orderBy('created_at', 'desc')
				->value('comanda');

			if ($comandaAtiva !== null) {
				session()->put('comanda_atual', $comandaAtiva);

				return;
			}
		}

		session()->put('comanda_atual', uuid_create());
	}
}