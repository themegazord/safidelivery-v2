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
    // 1. Pedidos - empresa + status + data
    Schema::table('pedidos', function (Blueprint $table) {
      $table->index(['empresa_id', 'status', 'created_at'], 'pedidos_empresa_id_status_created_at_index');
    });

    // 2. Notificações - empresa + lida + data
    Schema::table('notificacoes', function (Blueprint $table) {
      $table->index(['empresa_id', 'lida', 'created_at'], 'notificacoes_empresa_id_lida_created_at_index');
    });

    // 3. Itens - categoria + soft delete
    Schema::table('itens', function (Blueprint $table) {
      $table->index(['categoria_id', 'deleted_at'], 'itens_categoria_id_deleted_at_index');
    });

    // 4. Categorias - empresa (para relação com empresa)
    Schema::table('categorias', function (Blueprint $table) {
      $table->index(['cardapio_id'], 'categorias_cardapio_id_index');
    });

    Schema::table('cardapios', function (Blueprint $table) {
      $table->index(['empresa_id'], 'cardapios_empresa_id_index');
    });

    // 6. Financeiro Pedido - pedido_id único (relação 1:1)
    Schema::table('financeiro_pedido', function (Blueprint $table) {
      $table->index(['pedido_id'], 'financeiro_pedido_pedido_id_index');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {

  }
};
