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
    Schema::create('importacao_item_ifood', function (Blueprint $table) {
      $table->id();
      $table->foreignId('item_id')->constrained('itens', 'id')->cascadeOnDelete();
      $table->uuid('item_ifood_id')->index('idx_item_ifood_id_importacao_item_ifood');
      $table->uuid('product_id')->index('idx_product_id_importacao_item_ifood');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('importacao_item_ifood', function (Blueprint $table) {
      $table->dropIndex('idx_item_ifood_id_importacao_item_ifood');
      $table->dropIndex('idx_product_id_importacao_item_ifood');
    });
    Schema::dropIfExists('importacao_item_ifood');
  }
};
