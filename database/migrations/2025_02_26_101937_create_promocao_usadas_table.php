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
    Schema::create('promocao_usada', function (Blueprint $table) {
      $table->id();
      $table->foreignId('promocao_id')->constrained('promocao', 'id')->cascadeOnDelete();
      $table->foreignId('cliente_id')->constrained('clientes', 'id')->cascadeOnDelete();
      $table->foreignId('pedido_id')->constrained('pedidos', 'id')->cascadeOnDelete();
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('promocao_usada');
  }
};
