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
    Schema::create('notificacoes', function (Blueprint $table) {
      $table->id();
      $table->foreignId('empresa_id')->constrained('empresas');
      $table->string('tipo');
      $table->string('titulo');
      $table->text('mensagem');
      $table->json('data')->nullable();
      $table->boolean('lida')->default(false);
      $table->timestamp('lida_em')->nullable();
      $table->timestamps();

      $table->index(['empresa_id', 'created_at']);
      $table->index(['tipo', 'created_at']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('notificacoes');
  }
};
