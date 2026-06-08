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
    Schema::create('itens', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('categoria_id');
      $table->string('tipo', 3); // PRE, BEB, IND, PIZ
      $table->string('nome');
      $table->string('tipo_preco'); // fixo, por_tamanho
      $table->decimal('preco', 10, 2)->nullable(); // Nullable for 'por_tamanho'
      $table->text('descricao')->nullable();
      $table->integer('qtde_pessoas')->nullable();
      $table->string('peso')->nullable();
      $table->json('classificacao')->nullable(); // Array of classifications
      $table->timestamps();

      // Foreign keys
      $table->foreign('categoria_id')->references('id')->on('categorias')->onDelete('cascade');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('itens', function (Blueprint $table) {
      $table->dropForeign('itens_categoria_id_foreign');
    });
    Schema::dropIfExists('itens');
  }
};
