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
    Schema::table('pedidos', function (Blueprint $table) {
      $table->boolean('eh_agendado')->default(false)->after('status');
      $table->datetime('data_agendamento_inicio')->nullable()->after('telefone');
      $table->datetime('data_agendamento_fim')->nullable()->after('data_agendamento_inicio');
      $table->datetime('data_inicio_preparo')->nullable()->after('data_agendamento_fim');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('pedidos', function (Blueprint $table) {
      $table->dropcolumn(['eh_agendado', 'data_agendamento_inicio', 'data_agendamento_fim', 'data_inicio_preparo']);
    });
  }
};
