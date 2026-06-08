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
    Schema::create('financeiro_pedido', function (Blueprint $table) {
      $table->uuid();
      $table->foreignId('pedido_id')->constrained('pedidos', 'id')->cascadeOnDelete();
      $table->string('forma_pagamento', 20);
      $table->float('total');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('financeiro_pedido');
  }
};
