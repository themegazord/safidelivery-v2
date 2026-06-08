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
    Schema::table('pedido_itens', function (Blueprint $table) {
      $table->foreignId('tamanho_id')->after('uuid')->nullable()->constrained('categoria_tamanho');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('pedido_itens', function (Blueprint $table) {
      $table->dropConstrainedForeignId('tamanho_id');
    });
  }
};
