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
    Schema::table('pedido_itens', function (Blueprint $table) {
      $table->foreignId('borda_id')->after('item_id')->nullable()->constrained('categoria_borda', 'id');
      $table->foreignId('massa_id')->after('borda_id')->nullable()->constrained('categoria_massa', 'id');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('pedido_itens', function (Blueprint $table) {
      $table->dropConstrainedForeignId('borda_id');
      $table->dropConstrainedForeignId('massa_id');
    });
  }
};
