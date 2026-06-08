<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pedido_itens', function (Blueprint $table) {
            $table->float('preco_borda')->nullable()->default(0)->after('borda_id');
            $table->float('preco_massa')->nullable()->default(0)->after('massa_id');
        });

        // Backfill com o preço atual das bordas/massas para registros existentes
        DB::statement('
            UPDATE pedido_itens pi
            LEFT JOIN categoria_borda cb ON cb.id = pi.borda_id
            LEFT JOIN categoria_massa cm ON cm.id = pi.massa_id
            SET pi.preco_borda = COALESCE(cb.preco, 0),
                pi.preco_massa = COALESCE(cm.preco, 0)
            WHERE pi.tipo = \'P\'
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pedido_itens', function (Blueprint $table) {
            $table->dropColumn(['preco_borda', 'preco_massa']);
        });
    }
};
