<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedido_combo_item_customizacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_combo_item_id')->constrained('pedido_combo_itens')->cascadeOnDelete();
            $table->string('uuid')->nullable();
            $table->string('external_id')->nullable();
            $table->string('grupo_nome');
            $table->string('nome');
            $table->decimal('preco_unitario', 10, 2)->default(0);
            $table->unsignedSmallInteger('qtde')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedido_combo_item_customizacoes');
    }
};
