<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cashback_creditos', function (Blueprint $table) {
            $table->float('saldo_restante')->nullable()->after('credito_gerado');
            $table->dateTime('usado_em')->nullable()->after('data_vencimento');
        });

        // Inicializa saldo_restante = credito_gerado para registros existentes
        \Illuminate\Support\Facades\DB::table('cashback_creditos')
            ->whereNull('saldo_restante')
            ->update(['saldo_restante' => \Illuminate\Support\Facades\DB::raw('credito_gerado')]);
    }

    public function down(): void
    {
        Schema::table('cashback_creditos', function (Blueprint $table) {
            $table->dropColumn(['saldo_restante', 'usado_em']);
        });
    }
};
