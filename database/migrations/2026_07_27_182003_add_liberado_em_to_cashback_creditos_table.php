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
            $table->dateTime('liberado_em')->nullable()->after('data_vencimento');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cashback_creditos', function (Blueprint $table) {
            $table->dropColumn('liberado_em');
        });
    }
};
