<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {

    Schema::table('clientes', function (Blueprint $table) {
      // 2) renomeia o índice: dropa o antigo e cria um novo com nome claro
      $table->renameColumn('cpf', 'cpf_cnpj');
      $table->dropUnique('clientes_cpf_unique');              // antigo
      $table->unique('cpf_cnpj', 'clientes_cpf_cnpj_unique'); // novo
    });
  }

  public function down(): void
  {

    Schema::table('clientes', function (Blueprint $table) {
      // volta nome do índice
      $table->renameColumn('cpf_cnpj', 'cpf');
      $table->dropUnique('clientes_cpf_cnpj_unique');
      $table->unique('cpf', 'clientes_cpf_unique');
    });
  }
};
