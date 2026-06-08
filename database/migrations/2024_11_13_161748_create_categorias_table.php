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
    Schema::create('categorias', function (Blueprint $table) {
      $table->id();
      $table->foreignId('cardapio_id');
      $table->string('tipo');
      $table->string('nome');
      $table->timestamps();

      $table->foreign('cardapio_id')->references('id')->on('cardapios')->cascadeOnDelete();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('categorias', function (Blueprint $table): void {
      $table->dropForeign('categorias_cardapio_id_foreign');
    });
    Schema::dropIfExists('categorias');
  }
};
