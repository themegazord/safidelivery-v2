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
    Schema::create('pedidos_integracao_ifood', function (Blueprint $table) {
      $table->uuid();
      $table->foreignId('empresa_id')->constrained('empresas', 'id')->cascadeOnDelete();
      $table->uuid('orderId');
      $table->string('fullCode');
      $table->string('code');
      $table->json('metadata');
      $table->timestamp('created_ifood_at');
      $table->timestamp('viewed_at')->nullable();
      $table->timestamps();

      $table->index('orderId');
      $table->index('uuid');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('pedidos_integracao_ifood', function (Blueprint $table) {
      $table->dropIndex('pedidos_integracao_ifood_orderid_index');
      $table->dropIndex('pedidos_integracao_ifood_uuid_index');
    });
    Schema::dropIfExists('pedidos_integracao_ifood');
  }
};
