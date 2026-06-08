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
    Schema::create('promocao', function (Blueprint $table) {
      $table->id();
      $table->foreignId('empresa_id')->constrained('empresas', 'id');
      $table->string('nome_cupom', 50);
      $table->string('descricao_cupom');
      $table->boolean('valido_cliente_novo');
      $table->string('onde_afetara', 20);
      $table->string('tipo_cupom', 20);
      $table->float('valor_desconto');
      $table->float('valor_minimo_pedido');
      $table->float('valor_maximo_desconto');
      $table->string('qtde_clientes_usabilidade', 20);
      $table->integer('qtde_clientes');
      $table->integer('qtde_usos');
      $table->date('data_vencimento');
      $table->json('dias_disponiveis');
      $table->boolean('cupom_visivel');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('promocao');
  }
};
