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
      $table->boolean('desconto')->default(false)->after('preco');
      $table->float('valor_desconto')->after('desconto')->nullable();
      $table->float('porcentagem_desconto')->after('valor_desconto')->nullable();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('itens', function (Blueprint $table) {
      $table->dropColumn(['desconto', 'valor_desconto', 'porcentagem_desconto']);
    });
  }
};
