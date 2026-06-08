<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedido_combo_itens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_item_id')->constrained('pedido_itens')->cascadeOnDelete();
            $table->enum('tipo', ['item', 'complemento']);
            $table->string('grupo_nome');
            $table->string('item_nome');
            $table->decimal('preco_unitario', 10, 2)->default(0);
            $table->unsignedSmallInteger('qtde')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedido_combo_itens');
    }
};
