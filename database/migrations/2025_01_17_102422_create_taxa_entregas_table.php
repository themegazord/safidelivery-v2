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
    Schema::create('taxa_entrega', function (Blueprint $table) {
      $table->id();
      $table->foreignId('empresa_id')->constrained('empresas', 'id')->cascadeOnDelete();
      $table->integer('raio');
      $table->integer('tempo');
      $table->float('taxa');
      $table->string('corCirculo');
      $table->string('corPreenchimento');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('taxa_entrega');
  }
};
