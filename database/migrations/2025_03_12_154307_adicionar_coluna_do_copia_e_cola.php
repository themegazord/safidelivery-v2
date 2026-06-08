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
    Schema::table('status_financeiro_pedido_api', function (Blueprint $table) {
      $table->text('copia_cola_pix')->after('status')->nullable();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('status_financeiro_pedido_api', function (Blueprint $table) {
      $table->dropColumn('copia_cola_pix');
    });
  }
};
