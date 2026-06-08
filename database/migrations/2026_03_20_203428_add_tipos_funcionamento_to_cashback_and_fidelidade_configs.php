<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cashback_configs', function (Blueprint $table) {
            $table->json('tipos_funcionamento')->nullable()->after('status');
        });

        Schema::table('fidelidade_configs', function (Blueprint $table) {
            $table->json('tipos_funcionamento')->nullable()->after('validade_dias');
        });
    }

    public function down(): void
    {
        Schema::table('cashback_configs', function (Blueprint $table) {
            $table->dropColumn('tipos_funcionamento');
        });

        Schema::table('fidelidade_configs', function (Blueprint $table) {
            $table->dropColumn('tipos_funcionamento');
        });
    }
};
