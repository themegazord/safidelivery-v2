<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('promocao_usada_ifood', function (Blueprint $table) {
      $table->id();
      $table->foreignId('pedido_id')->constrained('pedidos')->cascadeOnDelete();

      // ENUMs
      $table->enum('responsavel_desconto', ['IFOOD', 'EXTERNAL', 'MERCHANT', 'CHAIN']);
      $table->enum('alvo_desconto', ['CART', 'DELIVERY_FEE', 'ITEM', 'PROGRESSIVE_DISCOUNT_ITEM']);

      // Valores monetários: use DECIMAL
      $table->float('valor');

      // Quando alvo = ITEM, o iFood define um targetId do item
      $table->string('alvo_id')->nullable();

      // Dados extras da campanha/desconto
      $table->json('meta')->nullable();

      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('promocao_usada_ifood');
  }
};
