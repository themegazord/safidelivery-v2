<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->string('fidelidade_recompensa_aplicada')->nullable()->after('valor_frete');
            $table->decimal('fidelidade_desconto', 10, 2)->default(0)->after('fidelidade_recompensa_aplicada');
            $table->decimal('frete_original', 10, 2)->nullable()->after('fidelidade_desconto');
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn(['fidelidade_recompensa_aplicada', 'fidelidade_desconto', 'frete_original']);
        });
    }
};
