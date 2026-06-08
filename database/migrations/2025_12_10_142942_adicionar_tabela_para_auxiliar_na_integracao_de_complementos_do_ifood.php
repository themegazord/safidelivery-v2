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
    Schema::create('importacao_complemento_ifood', function (Blueprint $table) {
      $table->id();
      $table->foreignId('complemento_id')->constrained('complementos', 'id')->cascadeOnDelete();
      $table->uuid('option_id')->index('idx_option_id_importacao_complemento_ifood');
      $table->uuid('product_id')->index('idx_product_id_importacao_complemento_ifood');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('importacao_complemento_ifood', function (Blueprint $table) {
      $table->dropIndex('idx_option_id_importacao_complemento_ifood');
      $table->dropIndex('idx_product_id_importacao_complemento_ifood');
    });
    Schema::dropIfExists('importacao_complemento_ifood');
  }
};
