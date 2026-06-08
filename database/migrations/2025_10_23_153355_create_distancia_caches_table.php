<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('distancia_caches', function (Blueprint $table) {
      $table->id();
      $table->string('hash_endereco_origem', 32);
      $table->string('hash_endereco_entrega', 32);
      $table->decimal('distancia_km', 8, 3);
      $table->integer('duracao');
      $table->string('duracao_formatada');
      $table->timestamps();

      $table->unique(['hash_endereco_origem', 'hash_endereco_entrega'], 'origem_destino_unique');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('distancia_caches');
  }
};
