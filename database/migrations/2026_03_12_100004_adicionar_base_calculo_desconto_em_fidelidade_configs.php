<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fidelidade_configs', function (Blueprint $table) {
            $table->enum('base_calculo_desconto', ['subtotal_itens', 'total_pedido'])
                ->default('subtotal_itens')
                ->after('valor_recompensa');
        });
    }

    public function down(): void
    {
        Schema::table('fidelidade_configs', function (Blueprint $table) {
            $table->dropColumn('base_calculo_desconto');
        });
    }
};
