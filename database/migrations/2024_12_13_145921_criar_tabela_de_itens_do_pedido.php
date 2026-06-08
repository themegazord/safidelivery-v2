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
    Schema::create('pedido_itens', function (Blueprint $table) {
      $table->id();
      $table->foreignId('pedido_id')->constrained('pedidos')->cascadeOnDelete(); // Relaciona com pedidos
      $table->foreignId('item_id')->constrained('itens')->restrictOnDelete(); // ID do item (relaciona com cardápio)
      $table->string('nome'); // Nome do item
      $table->integer('quantidade'); // Quantidade do item
      $table->float('preco_unitario'); // Preço unitário do item
      $table->float('subtotal'); // Preço total do item (can be derived logically)
      $table->string('tipo', 1)->nullable(); // Tipo do item, como "I" (individual) ou "P" (pizza)
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('pedido_itens');
  }
};
