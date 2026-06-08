<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('financeiro_pedido', function (Blueprint $table) {
            $table->float('subtotal_itens')->nullable()->after('total');
        });

        // Popula registros existentes.
        // Itens tipo 'I': usa pedido_itens.subtotal diretamente.
        // Itens tipo 'P' do iFood: subtotal já vem preenchido com totalPrice da API — usa diretamente.
        // Itens tipo 'P' nativos (subtotal = 0): calcula via sabores + borda + massa.
        DB::statement('
            UPDATE financeiro_pedido fp
            SET fp.subtotal_itens = (
                SELECT COALESCE(SUM(
                    CASE
                        WHEN pi.tipo = \'I\' THEN COALESCE(pi.subtotal, 0)
                        WHEN pi.tipo = \'P\' AND COALESCE(pi.subtotal, 0) > 0 THEN COALESCE(pi.subtotal, 0)
                        WHEN pi.tipo = \'P\' THEN pi.quantidade * (
                            COALESCE((
                                SELECT SUM(psp.preco_unitario * psp.qtde)
                                FROM pedido_sabores_pizza psp
                                WHERE psp.pedido_item_id = pi.id
                            ), 0)
                            + COALESCE((SELECT cb.preco FROM categoria_borda cb WHERE cb.id = pi.borda_id), 0)
                            + COALESCE((SELECT cm.preco FROM categoria_massa cm WHERE cm.id = pi.massa_id), 0)
                        )
                        ELSE 0
                    END
                ), 0)
                FROM pedido_itens pi
                WHERE pi.pedido_id = fp.pedido_id
            )
        ');
    }

    public function down(): void
    {
        Schema::table('financeiro_pedido', function (Blueprint $table) {
            $table->dropColumn('subtotal_itens');
        });
    }
};
