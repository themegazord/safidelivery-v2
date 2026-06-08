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
    Schema::create('categoria_borda', function (Blueprint $table) {
      $table->id();
      $table->foreignId('categoria_id');
      $table->string('nome');
      $table->float('preco');
      $table->timestamps();

      $table->foreign('categoria_id')->references('id')->on('categorias')->cascadeOnDelete();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('categoria_borda', function (Blueprint $table) {
      $table->dropForeign('categoria_borda_categoria_id_foreign');
    });
    Schema::dropIfExists('categoria_borda');
  }
};
