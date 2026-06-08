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
        Schema::create('combo_entradas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('combo_id')->constrained('itens')->cascadeOnDelete();
            $table->string('tipo', 20);
            $table->foreignId('combo_grupo_id')->nullable()->constrained('combo_grupos')->cascadeOnDelete();
            $table->foreignId('grupo_complemento_id')->nullable()->constrained('grupo_complemento')->nullOnDelete();
            $table->unsignedBigInteger('referencia_id')->nullable();
            $table->string('nome_snapshot');
            $table->decimal('preco_snapshot', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('combo_entradas');
    }
};
