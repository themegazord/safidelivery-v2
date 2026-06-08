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
        Schema::table('pedido_itens', function (Blueprint $table) {
            // Alterar borda_id para nullOnDelete
            $table->dropForeign(['borda_id']);
            $table->foreign('borda_id')->references('id')->on('categoria_borda')->nullOnDelete();

            // Alterar massa_id para nullOnDelete
            $table->dropForeign(['massa_id']);
            $table->foreign('massa_id')->references('id')->on('categoria_massa')->nullOnDelete();

            // Alterar tamanho_id para nullOnDelete
            $table->dropForeign(['tamanho_id']);
            $table->foreign('tamanho_id')->references('id')->on('categoria_tamanho')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pedido_itens', function (Blueprint $table) {
            // Reverter borda_id para restrict
            $table->dropForeign(['borda_id']);
            $table->foreign('borda_id')->references('id')->on('categoria_borda')->restrictOnDelete();

            // Reverter massa_id para restrict
            $table->dropForeign(['massa_id']);
            $table->foreign('massa_id')->references('id')->on('categoria_massa')->restrictOnDelete();

            // Reverter tamanho_id para restrict
            $table->dropForeign(['tamanho_id']);
            $table->foreign('tamanho_id')->references('id')->on('categoria_tamanho')->restrictOnDelete();
        });
    }
};
