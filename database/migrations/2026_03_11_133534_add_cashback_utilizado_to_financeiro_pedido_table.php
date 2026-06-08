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
        Schema::table('financeiro_pedido', function (Blueprint $table) {
            $table->float('cashback_utilizado')->default(0)->after('total');
        });
    }

    public function down(): void
    {
        Schema::table('financeiro_pedido', function (Blueprint $table) {
            $table->dropColumn('cashback_utilizado');
        });
    }
};
