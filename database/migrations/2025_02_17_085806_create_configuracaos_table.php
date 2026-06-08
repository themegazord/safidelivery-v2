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
    Schema::create('configuracoes', function (Blueprint $table) {
      $table->id();
      $table->foreignId('empresa_id')->constrained('empresas', 'id');
      $table->string('configuracao');
      $table->string('valor')->nullable();
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('configuracoes');
  }
};
