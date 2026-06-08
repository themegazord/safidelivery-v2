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
      $table->string('telefone_comercial', 15)->after('email');
      $table->string('telefone_contato', 15)->after('telefone_comercial');
      $table->string('telefone_whatsapp', 15)->after('telefone_contato');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('empresas', function (Blueprint $table) {
      $table->dropColumn(['telefone_comercial', 'telefone_contato', 'telefone_whatsapp']);
    });
  }
};
