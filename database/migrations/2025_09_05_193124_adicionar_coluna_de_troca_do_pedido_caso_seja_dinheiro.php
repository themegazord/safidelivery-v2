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
    Schema::table('financeiro_pedido', function (Blueprint $table) {
      $table->float('troco_para')->after('total')->nullable();
      $table->float('valor_troco')->after('troco_para')->nullable();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('financeiro_pedido', function (Blueprint $table) {
      $table->dropColumn(['troco_para', 'valor_troco']);
    });
  }
};
