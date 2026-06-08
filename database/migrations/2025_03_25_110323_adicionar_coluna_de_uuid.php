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
    Schema::table('pedido_sabores_pizza', function (Blueprint $table) {
      $table->uuid()->after('sabor_id');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('pedido_sabores_pizza', function (Blueprint $table) {
      $table->dropColumn('uuid');
    });
  }
};
