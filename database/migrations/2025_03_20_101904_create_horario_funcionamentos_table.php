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
    Schema::create('horario_funcionamento', function (Blueprint $table) {
      $table->id();
      $table->foreignId('empresa_id')->constrained('empresas', 'id')->cascadeOnDelete();
      $table->smallInteger('dia_semana');
      $table->string('tipo_funcionamento');
      $table->boolean('status');
      $table->time('hora_inicio');
      $table->time('hora_fim');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('horario_funcionamento');
  }
};
