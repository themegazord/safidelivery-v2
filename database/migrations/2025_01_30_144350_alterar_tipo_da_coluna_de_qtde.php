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
      $table->float('qtde_fracionada')->after('qtde');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('pedido_sabores_pizza', function (Blueprint $table) {
      $table->dropColumn('qtde_fracionada');
    });
  }
};
