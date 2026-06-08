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
    Schema::table('itens', function (Blueprint $table) {
      $table->string('gramagem')->after('peso')->nullable();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('itens', function (Blueprint $table) {
      $table->dropColumn('gramagem');
    });
  }
};
