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
    Schema::create('complementos', function (Blueprint $table) {
      $table->id();
      $table->foreignId('grupo_id');
      $table->string('nome');
      $table->string('descricao')->nullable();
      $table->float('preco');
      $table->boolean('status');
      $table->timestamps();

      $table->foreign('grupo_id')->references('id')->on('grupo_complemento')->cascadeOnDelete();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('complementos', function (Blueprint $table) {
      $table->dropForeign('complementos_grupo_id_foreign');
    });
    Schema::dropIfExists('complementos');
  }
};
