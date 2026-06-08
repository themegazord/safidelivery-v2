<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Valores que não correspondem a nenhuma FormaPagamento real —
     * 'multiplo' e 'cashback'/'VIR' são virtuais e ficam com id nulo.
     */
    private array $ignorar = ['multiplo', 'cashback', 'VIR'];

    public function up(): void
    {
        $this->preencherFinanceiroPedido();
        $this->preencherFinanceiroPedidoPagamentos();
    }

    public function down(): void
    {
        DB::table('financeiro_pedido')->update(['forma_pagamento_id' => null]);
        DB::table('financeiro_pedido_pagamentos')->update(['forma_pagamento_id' => null]);
    }

    private function preencherFinanceiroPedido(): void
    {
        DB::table('financeiro_pedido as fp')
            ->join('pedidos as p', 'p.id', '=', 'fp.pedido_id')
            ->whereNull('fp.forma_pagamento_id')
            ->whereNotNull('fp.forma_pagamento')
            ->whereNotIn('fp.forma_pagamento', $this->ignorar)
            ->select('fp.uuid', 'fp.forma_pagamento', 'p.empresa_id')
            ->orderBy('fp.uuid')
            ->chunk(200, function ($registros) {
                foreach ($registros as $registro) {
                    $id = $this->buscarFormaPagamentoId(
                        $registro->empresa_id,
                        $registro->forma_pagamento
                    );

                    if ($id) {
                        DB::table('financeiro_pedido')
                            ->where('uuid', $registro->uuid)
                            ->update(['forma_pagamento_id' => $id]);
                    }
                }
            });
    }

    private function preencherFinanceiroPedidoPagamentos(): void
    {
        DB::table('financeiro_pedido_pagamentos as fpp')
            ->join('financeiro_pedido as fp', 'fp.uuid', '=', 'fpp.financeiro_pedido_uuid')
            ->join('pedidos as p', 'p.id', '=', 'fp.pedido_id')
            ->whereNull('fpp.forma_pagamento_id')
            ->whereNotNull('fpp.forma_pagamento')
            ->whereNotIn('fpp.forma_pagamento', $this->ignorar)
            ->select('fpp.id', 'fpp.forma_pagamento', 'p.empresa_id')
            ->orderBy('fpp.id')
            ->chunk(200, function ($registros) {
                foreach ($registros as $registro) {
                    $id = $this->buscarFormaPagamentoId(
                        $registro->empresa_id,
                        $registro->forma_pagamento
                    );

                    if ($id) {
                        DB::table('financeiro_pedido_pagamentos')
                            ->where('id', $registro->id)
                            ->update(['forma_pagamento_id' => $id]);
                    }
                }
            });
    }

    private function buscarFormaPagamentoId(int $empresaId, string $forma): ?int
    {
        return DB::table('forma_pagamento')
            ->where('empresa_id', $empresaId)
            ->whereNull('deleted_at')
            ->where(function ($q) use ($forma) {
                $q->where('tipo', 'like', '%' . $forma . '%')
                  ->orWhere('descricao', 'like', '%' . $forma . '%');
            })
            ->value('id');
    }
};
