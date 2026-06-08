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
    Schema::table('pedido_itens', function (Blueprint $table) {
      $table->foreignId('item_id')->nullable()->change();
      $table->float('subtotal')->nullable()->change();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('pedido_itens', function (Blueprint $table) {
      $table->foreignId('item_id')->nullable(false)->change();
      $table->float('subtotal')->nullable(false)->change();
    });
  }
};
