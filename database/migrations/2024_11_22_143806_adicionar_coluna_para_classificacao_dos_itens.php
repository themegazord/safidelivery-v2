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
    Schema::table('item_preco', function (Blueprint $table) {
      $table->json('classificacao')->after('preco')->nullable();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('item_preco', function (Blueprint $table) {
      $table->dropColumn('classificacao');
    });
  }
};
