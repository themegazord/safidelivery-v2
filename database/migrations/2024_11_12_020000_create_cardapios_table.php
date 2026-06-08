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
    Schema::create('cardapios', function (Blueprint $table) {
      $table->id();
      $table->foreignId('empresa_id');
      $table->string('nome');
      $table->string('descricao');
      $table->json('dias_funcionamento');
      $table->timestamps();

      $table->foreign('empresa_id')->references('id')->on('empresas')->cascadeOnDelete();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('cardapios', function (Blueprint $table) {
      $table->dropForeign('cardapios_empresa_id_foreign');
    });
    Schema::dropIfExists('cardapios');
  }
};
