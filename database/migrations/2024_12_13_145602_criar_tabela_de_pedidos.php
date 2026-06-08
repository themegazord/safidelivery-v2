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
    Schema::create('pedidos', function (Blueprint $table) {
      $table->id();
      $table->foreignId('cliente_id')->constrained('clientes')->restrictOnDelete(); // Define a relação com a tabela clientes
      $table->string('tipo', 1); // Ex.: "I" ou "P"
      $table->string('status', 50)->default('pendente'); // Status do pedido
      $table->float('total'); // Total do pedido
      $table->timestamps(); // created_at e updated_at
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('pedidos', function (Blueprint $table) {
      $table->dropConstrainedForeignId('cliente_id');
    });

    Schema::dropIfExists('pedidos');
  }
};
