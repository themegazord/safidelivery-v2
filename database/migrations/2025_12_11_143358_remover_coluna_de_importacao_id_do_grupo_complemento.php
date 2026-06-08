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
    Schema::table('grupo_complemento', function (Blueprint $table) {
      $table->dropColumn('importacao_id');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('grupo_complemento', function (Blueprint $table) {
      $table->string('importacao_id', 100)->after('id');
    });
  }
};
