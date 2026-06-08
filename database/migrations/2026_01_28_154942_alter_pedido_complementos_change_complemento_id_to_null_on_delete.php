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
        Schema::table('pedido_complementos', function (Blueprint $table) {
            $table->dropForeign(['complemento_id']);
            $table->foreignId('complemento_id')->nullable()->change();
            $table->foreign('complemento_id')->references('id')->on('complementos')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pedido_complementos', function (Blueprint $table) {
            $table->dropForeign(['complemento_id']);
            $table->foreignId('complemento_id')->nullable(false)->change();
            $table->foreign('complemento_id')->references('id')->on('complementos')->restrictOnDelete();
        });
    }
};
