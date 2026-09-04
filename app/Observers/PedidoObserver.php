<?php

namespace App\Observers;

use App\Jobs\Empresa\EnviaNotificacaoWhatsappStatusPedidoJob;
use App\Models\CashbackConfig;
use App\Models\CashbackCredito;
use App\Models\Pedido;
use App\Services\Fidelidade\FidelidadeService;

class PedidoObserver
{
    private const DIAS_VALIDADE_ESTORNO_PADRAO = 90;

    private const STATUS_NOTIFICAVEIS_WHATSAPP = [
        'aceito',
        'sendo preparado',
        'pronto para entrega',
        'pronto para retirada',
        'sendo entregue',
        'entregue',
        'cancelado',
    ];

    /**
     * Handle the Pedido "updated" event.
     */
    public function updated(Pedido $pedido): void
    {
        if (! $pedido->wasChanged('status')) {
            return;
        }

        $this->notificarStatusPedidoWhatsapp($pedido);

        $status = $pedido->getAttribute('status');

        if (in_array($status, Pedido::STATUS_CANCELADOS, true)) {
            // Crédito gerado por este pedido nunca chegou a ser liberado (pedido não
            // concluiu com sucesso) — não deve virar cashback usável pelo cliente.
            // Precisa ser removido antes do estorno abaixo pra liberar o slot
            // único de pedido_id em cashback_creditos.
            $pedido->cashback()->whereNull('liberado_em')->delete();

            $this->estornaCashbackUtilizado($pedido);

            return;
        }

        if (! in_array($status, Pedido::STATUS_FINALIZADOS_SUCESSO, true)) {
            return;
        }

        $pedido->cashback()
            ->whereNull('liberado_em')
            ->update(['liberado_em' => now()]);

        app(FidelidadeService::class)->registrarPedidoConcluido($pedido);
    }

    /**
     * Não existe um ledger ligando cada consumo a um crédito específico
     * (ConsomeCashbackAction debita o mais antigo disponível sem registrar a origem),
     * então o estorno é criado como um novo crédito já liberado, no valor total
     * que foi usado como pagamento neste pedido.
     */
    private function estornaCashbackUtilizado(Pedido $pedido): void
    {
        $cashbackUtilizado = (float) ($pedido->financeiro?->cashback_utilizado ?? 0);

        if ($cashbackUtilizado <= 0 || ! $pedido->cliente_id) {
            return;
        }

        $diasValidade = (int) (CashbackConfig::where('empresa_id', $pedido->empresa_id)->value('dias_validade')
            ?? self::DIAS_VALIDADE_ESTORNO_PADRAO);

        CashbackCredito::create([
            'empresa_id' => $pedido->empresa_id,
            'cliente_id' => $pedido->cliente_id,
            'pedido_id' => $pedido->id,
            'credito_gerado' => $cashbackUtilizado,
            'saldo_restante' => $cashbackUtilizado,
            'data_gerado' => now(),
            'data_vencimento' => now()->addDays($diasValidade),
            'liberado_em' => now(),
        ]);
    }

    private function notificarStatusPedidoWhatsapp(Pedido $pedido): void
    {
        if (! in_array($pedido->getAttribute('status'), self::STATUS_NOTIFICAVEIS_WHATSAPP, true)) {
            return;
        }

        EnviaNotificacaoWhatsappStatusPedidoJob::dispatch($pedido->id)->afterCommit();
    }
}
