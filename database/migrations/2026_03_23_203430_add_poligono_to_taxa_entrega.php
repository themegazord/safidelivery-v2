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
        Schema::table('taxa_entrega', function (Blueprint $table) {
            $table->string('tipo')->default('raio')->after('empresa_id');
            $table->json('coordenadas')->nullable()->after('corPreenchimento');
        });
    }

    public function down(): void
    {
        Schema::table('taxa_entrega', function (Blueprint $table) {
            $table->dropColumn(['tipo', 'coordenadas']);
        });
    }
};
