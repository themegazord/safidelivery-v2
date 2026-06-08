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
    Schema::create('empresas', function (Blueprint $table) {
      $table->id();
      $table->string('razao_social', 255);
      $table->string('nome_fantasia', 255);
      $table->string('cnpj', 14)->unique();
      $table->string('email', 255)->unique();
      $table->timestamps();

      $table->index(['cnpj']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('empresas');
  }
};
