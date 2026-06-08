<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::table('pedidos', function (Blueprint $table) {
      $table->string('pedido_ifood_id')->after('id')->nullable();
      $table->index('pedido_ifood_id');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('pedidos', function (Blueprint $table) {
      $table->dropIndex('pedidos_pedido_ifood_id_index');
      $table->dropColumn('pedido_ifood_id');
    });
  }
};
