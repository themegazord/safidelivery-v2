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
        Schema::create('combos_meta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('combo_id')->unique()->constrained('itens')->cascadeOnDelete();
            $table->string('tipo_precificacao', 20)->default('preco_combo');
            $table->decimal('preco_combo', 10, 2)->nullable();
            $table->decimal('desconto_combo', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('combos_meta');
    }
};
