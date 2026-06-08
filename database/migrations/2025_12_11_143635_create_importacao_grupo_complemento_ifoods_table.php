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
    Schema::create('importacao_grupo_complemento_ifood', function (Blueprint $table) {
      $table->id();
      $table->foreignId('grupo_id')->constrained('grupo_complemento', 'id')->cascadeOnDelete();
      $table->uuid('option_group_id')->index('idx_option_group_id_importacao_grupo_complemento_ifood');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('importacao_grupo_complemento_ifood', function (Blueprint $table) {
      $table->dropIndex('idx_option_group_id_importacao_grupo_complemento_ifood');
    });
    Schema::dropIfExists('importacao_grupo_complemento_ifood');
  }
};
