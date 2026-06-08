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
    Schema::table('pedidos_integracao_ifood', function (Blueprint $table) {
      $table->index(['orderId', 'fullCode']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('pedidos_integracao_ifood', function (Blueprint $table) {
      $table->dropIndex('pedidos_integracao_ifood_uuid_unique');
      $table->dropIndex('pedidos_integracao_ifood_uuid_index');
      $table->dropIndex('pedidos_integracao_ifood_orderid_fullcode_index');
    });
  }
};
