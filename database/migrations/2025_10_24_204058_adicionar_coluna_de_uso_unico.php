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
    Schema::table('promocao', function (Blueprint $table) {
      $table->boolean('uso_unico')->default(false)->after('qtde_usos');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('promocao', function (Blueprint $table) {
      $table->dropColumn('uso_unico');
    });
  }
};
