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
      $table->string('telefone_comercial', 15)->nullable()->change();
      $table->string('telefone_contato', 15)->nullable()->change();
      $table->string('telefone_whatsapp', 15)->nullable()->change();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('empresas', function (Blueprint $table) {
      $table->string('telefone_comercial', 15)->nullable(false)->change();
      $table->string('telefone_contato', 15)->nullable(false)->change();
      $table->string('telefone_whatsapp', 15)->nullable(false)->change();
    });
  }
};
