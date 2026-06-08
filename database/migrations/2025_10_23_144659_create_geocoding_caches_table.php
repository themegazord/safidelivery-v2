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
    Schema::create('geocoding_caches', function (Blueprint $table) {
      $table->id();
      $table->string('endereco_formatado');
      $table->string('endereco_formatado_google');
      $table->string('hash_endereco', 32)->unique();
      $table->decimal('latitude', 10, 8);
      $table->decimal('longitude', 11, 8);
      $table->timestamps();

      $table->index('hash_endereco');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('geocoding_caches');
  }
};
