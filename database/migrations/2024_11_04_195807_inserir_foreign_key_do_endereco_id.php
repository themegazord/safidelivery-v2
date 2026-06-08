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
    Schema::table('empresas', function (Blueprint $table) {
      $table->foreignId('endereco_id');
      $table->foreign('endereco_id')->references('id')->on('enderecos');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('empresas', function (Blueprint $table) {
      $table->dropForeign('empresas_endereco_id_foreign');
      $table->dropColumn('endereco_id');
    });
  }
};
