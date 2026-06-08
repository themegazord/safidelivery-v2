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
      $table->integer('numero')->nullable()->after('id');
      $table->string('comanda')->nullable()->after('numero');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('pedidos', function (Blueprint $table) {
      $table->dropColumn(['numero', 'comanda']);
    });
  }
};
