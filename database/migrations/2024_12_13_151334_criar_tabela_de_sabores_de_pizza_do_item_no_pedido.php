<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('pedido_sabores_pizza', function (Blueprint $table) {
      $table->id();
      $table->foreignId('pedido_item_id')->constrained('pedido_itens')->cascadeOnDelete(); // Relaciona com os itens do pedido
      $table->foreignId('sabor_id')->constrained('itens')->restrictOnDelete(); // ID do sabor
      $table->string('nome'); // Nome do sabor
      $table->text('descricao')->nullable(); // Descrição do sabor
      $table->float('preco_unitario')->nullable(); // Preço por sabor
      $table->integer('qtde')->default(1); // Quantidade por sabor
      $table->timestamps(); // created_at e updated_at
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('pedido_sabores_pizza');
  }
};
