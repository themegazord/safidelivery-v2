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
		Schema::table('pedido_itens', function (Blueprint $table) {
			// Remove a constraint antiga
			$table->dropForeign(['item_id']);

			// Recria a constraint com cascadeOnDelete
			$table->foreign('item_id')
				->references('id')
				->on('itens')
				->cascadeOnDelete();
		});
	}

	/**
	 * Run the migrations.
	 */
	public function down(): void
	{
		Schema::table('pedido_itens', function (Blueprint $table) {
			// Remove a constraint com cascade
			$table->dropForeign(['item_id']);

			// Recria a constraint original com restrictOnDelete
			$table->foreign('item_id')
				->references('id')
				->on('itens')
				->restrictOnDelete();
		});
	}
};
