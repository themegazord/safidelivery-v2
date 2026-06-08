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
    Schema::create('item_preco', function (Blueprint $table) {
      $table->id();
      $table->foreignId('tamanho_id');
      $table->foreignId('item_id');
      $table->boolean('status')->default(true);
      $table->float('preco');

      $table->foreign('tamanho_id')->references('id')->on('categoria_tamanho');
      $table->foreign('item_id')->references('id')->on('itens')->onDelete('cascade');

      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('item_preco', function (Blueprint $table) {
      $table->dropForeign('item_preco_tamanho_id_foreign');
      $table->dropForeign('item_preco_item_id_foreign');
    });
    Schema::dropIfExists('item_preco');
  }
};
