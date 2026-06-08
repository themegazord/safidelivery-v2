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
    Schema::create('pedido_complementos', function (Blueprint $table) {
      $table->id();
      $table->foreignId('pedido_item_id')->constrained('pedido_itens')->cascadeOnDelete(); // Relaciona com os itens do pedido
      $table->foreignId('complemento_id')->constrained('complementos')->restrictOnDelete(); // ID do complemento
      $table->string('nome')->nullable(); // Nome do complemento (opcional)
      $table->integer('qtde')->default(0); // Quantidade do complemento
      $table->float('preco_unitario')->nullable(); // Preço do complemento (opcional)
      $table->timestamps(); // created_at e updated_at
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('pedido_complementos');
  }
};
