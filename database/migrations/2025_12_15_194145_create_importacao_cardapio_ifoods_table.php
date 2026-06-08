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
    Schema::create('importacao_cardapio_ifood', function (Blueprint $table) {
      $table->id();
      $table->foreignId('cardapio_id')->constrained('cardapios', 'id')->cascadeOnDelete();
      $table->uuid('catalogID');
      $table->json('context');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('importacao_cardapio_ifood');
  }
};
