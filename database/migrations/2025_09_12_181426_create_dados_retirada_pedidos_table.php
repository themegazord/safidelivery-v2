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
    Schema::create('dados_retirada_pedidos', function (Blueprint $table) {
      $table->id();

      // Relacionamento com pedidos
      $table->foreignUuid('pedido_ifood_id')
        ->constrained('pedidos', 'pedido_ifood_id')
        ->cascadeOnDelete();

      // Campos do grupo "takeout" da API
      $table->enum('mode', ['DEFAULT', 'PICKUP_AREA']);
      $table->timestamp('takeout_datetime')->nullable(); // "takeoutDateTime"
      $table->enum('location_type', ['MERCHANT'])->default('MERCHANT');

      // Suporte ao evento de vaga especial (PICKUP_AREA_ASSIGNED)
      $table->string('pickup_area_code')->nullable(); // ex.: "1"
      $table->enum('pickup_area_type', ['NUMBER', 'NAME'])->nullable();
      $table->timestamp('pickup_area_assigned_at')->nullable();

      $table->json('meta')->nullable(); // espaço extra p/ payloads adicionais
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('dados_retirada_pedidos');
  }
};
