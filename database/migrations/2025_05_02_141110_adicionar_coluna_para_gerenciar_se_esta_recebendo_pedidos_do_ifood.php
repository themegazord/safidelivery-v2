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
    Schema::table('empresas', function (Blueprint $table) {
      $table->boolean('esta_recebendo_pedidos_ifood')->default(false)->after('lifetimeTokenIfood');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('empresas', function (Blueprint $table) {
      $table->dropColumn('esta_recebendo_pedidos_ifood');
    });
  }
};
