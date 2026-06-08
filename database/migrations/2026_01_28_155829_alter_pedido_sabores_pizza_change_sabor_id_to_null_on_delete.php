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
        Schema::table('pedido_sabores_pizza', function (Blueprint $table) {
            $table->dropForeign(['sabor_id']);
            $table->foreignId('sabor_id')->nullable()->change();
            $table->foreign('sabor_id')->references('id')->on('itens')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pedido_sabores_pizza', function (Blueprint $table) {
            $table->dropForeign(['sabor_id']);
            $table->foreignId('sabor_id')->nullable(false)->change();
            $table->foreign('sabor_id')->references('id')->on('itens')->restrictOnDelete();
        });
    }
};
