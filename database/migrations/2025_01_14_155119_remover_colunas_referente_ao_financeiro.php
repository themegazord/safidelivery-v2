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
    Schema::table('pedidos', function (Blueprint $table) {
      $table->dropColumn(['forma_pagamento', 'total']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('pedidos', function (Blueprint $table) {
      $table->string('forma_pagamento', 20)->after('cliente_id');
      $table->float('total')->after('status');
    });
  }
};
