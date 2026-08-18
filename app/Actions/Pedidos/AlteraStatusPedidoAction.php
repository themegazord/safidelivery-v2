<?php

namespace App\Actions\Pedidos;

use App\Models\Pedido;
use App\Services\IFOOD\ApiExternalIfood;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AlteraStatusPedidoAction
{
    private const TRANSICOES_VALIDAS = [
        'aguardando_item_premio' => ['pendente', 'cancelado'],
        'pendente' => ['aceito', 'cancelado', 'aguardando pagamento', 'sendo preparado'],
        'aguardando pagamento' => ['pendente', 'cancelado'],
        'aceito' => ['sendo preparado', 'cancelado'],
        'sendo preparado' => ['pronto para entrega', 'pronto para retirada', 'cancelado'],
        'pronto para entrega' => ['sendo entregue', 'entregue', 'cancelado'],
        'pronto para retirada' => ['entregue', 'cancelado'],
        'sendo entregue' => ['entregue', 'cancelado'],
        'entregue para mesa' => ['entregue'],
        'pedido feito' => ['entregue'],
        'entregue' => [],
        'retirado' => [],
        'cancelado' => [],
    ];

    public function __construct(private ApiExternalIfood $api)
    {
    }

    public static function transicaoValida(string $statusAtual, string $novoStatus): bool
    {
        return in_array($novoStatus, self::TRANSICOES_VALIDAS[$statusAtual] ?? [], true);
    }

    public function handle(int $pedido_id, string $novoStatus): array
    {
        return DB::transaction(function () use ($pedido_id, $novoStatus) {
            $pedido = Pedido::where('id', $pedido_id)
                ->with(['cliente', 'financeiro', 'dadosRetiradaPedido'])
                ->lockForUpdate()
                ->first();

            if (! $pedido) {
                throw new Exception('Pedido não encontrado');
            }

            if (! self::transicaoValida($pedido->status, $novoStatus)) {
                throw new Exception("Transição inválida: {$pedido->status} → {$novoStatus}");
            }

            if ($pedido->pedido_ifood_id === null && $novoStatus === 'entregue') {
                return ['requer_confirmacao' => true, 'pedido' => $pedido];
            }

            $this->aplicar($pedido, $novoStatus);

            return ['requer_confirmacao' => false, 'pedido' => $pedido];
        });
    }

    public function aplicar(Pedido $pedido, string $novoStatus): void
    {
        $pedido->update(['status' => $novoStatus]);

        if ($pedido->pedido_ifood_id !== null) {
            $this->sincronizarComIfood($pedido);
        }
    }

    private function sincronizarComIfood(Pedido $pedido): void
    {
        try {
            $sincronizado = match ($pedido->status) {
                'sendo preparado' => $this->tentativa(fn () => $this->api->aceitarPedidoIfood($pedido->empresa_id, $pedido->pedido_ifood_id)),
                'pronto para retirada' => $this->tentativa(fn () => $this->api->prontoParaRetiradaPedidoIfood($pedido->empresa_id, $pedido->pedido_ifood_id)),
                'sendo entregue' => $this->tentativa(fn () => $this->api->dispacharPedidoIfood($pedido->empresa_id, $pedido->pedido_ifood_id)),
                'cancelado' => $this->cancelarNoIfood($pedido),
                default => null,
            };

            if ($sincronizado === false) {
                throw new Exception('Falha na sincronização do status com iFood');
            }
        } catch (Exception $e) {
            Log::error('Exceção ao sincronizar com iFood', [
                'pedido_id' => $pedido->id,
                'pedido_ifood_id' => $pedido->pedido_ifood_id,
                'status' => $pedido->status,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function tentativa(callable $callback): bool
    {
        try {
            $callback();

            return true;
        } catch (Exception $e) {
            Log::error('Exceção ao sincronizar status com iFood', ['error' => $e->getMessage()]);

            return false;
        }
    }

    private function cancelarNoIfood(Pedido $pedido): bool
    {
        try {
            $resposta = $this->api->solicitarCancelamentoIfood(
                $pedido->empresa_id,
                $pedido->pedido_ifood_id,
                'Cancelado pela loja',
                '501',
            );

            return $resposta->successful();
        } catch (Exception $e) {
            Log::error('Exceção ao cancelar pedido no iFood', ['pedido_id' => $pedido->id, 'error' => $e->getMessage()]);

            return false;
        }
    }
}
