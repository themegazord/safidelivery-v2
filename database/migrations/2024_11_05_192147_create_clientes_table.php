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
    Schema::create('clientes', function (Blueprint $table) {
      $table->id();
      $table->foreignId('endereco_id');
      $table->string('nome', 255);
      $table->string('email', 255)->unique();
      $table->string('cpf',11)->unique();
      $table->string('telefone', 20);
      $table->date('data_nascimento');
      $table->timestamps();

      $table->foreign('endereco_id')->references('id')->on('enderecos');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('clientes', function (Blueprint $table) {
      $table->dropForeign('clientes_endereco_id_foreign');
    });
    Schema::dropIfExists('clientes');
  }
};
