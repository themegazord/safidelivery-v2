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
		Schema::create('importacao_categoria_ifood', function (Blueprint $table) {
			$table->id();
			$table->foreignId('categoria_id')->constrained('categorias')->cascadeOnDelete();
			$table->uuid('category_id');
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('importacao_categoria_ifood');
	}
};
