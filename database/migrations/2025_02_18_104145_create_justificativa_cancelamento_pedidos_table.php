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
    Schema::create('justificativa_cancelamento_pedidos', function (Blueprint $table) {
      $table->id();
      $table->foreignId('pedido_id')->constrained('pedidos', 'id');
      $table->string('origem_cancelamento', 20);
      $table->text('motivo');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('justificativa_cancelamento_pedidos');
  }
};
