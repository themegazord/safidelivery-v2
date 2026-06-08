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
    Schema::create('horario_indisponibilidade', function (Blueprint $table) {
      $table->id();
      $table->foreignId('empresa_id')->constrained('empresas')->cascadeOnDelete();
      $table->string('titulo');
      $table->text('descricao')->nullable();
      $table->date('data_inicio');
      $table->date('data_fim');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('horario_indisponibilidade');
  }
};