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
    Schema::create('grupo_complemento', function (Blueprint $table) {
      $table->id();
      $table->foreignId('item_id')->nullable();
      $table->string('nome');
      $table->boolean('obrigatoriedade')->default(true);
      $table->integer('qtd_minima');
      $table->integer('qtd_maxima');
      $table->timestamps();

      $table->foreign('item_id')->references('id')->on('itens')->cascadeOnDelete();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('grupo_complemento', function (Blueprint $table) {
      $table->dropForeign('grupo_complemento_item_id_foreign');
    });
    Schema::dropIfExists('grupo_complemento');
  }
};
