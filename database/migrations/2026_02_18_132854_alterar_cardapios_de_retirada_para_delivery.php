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
		DB::transaction(function () {
			\App\Models\Cardapio::query()->where('cardapios.tipo_funcionamento', 'retirada')->update([
				'cardapios.tipo_funcionamento' => 'delivery'
			]);
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		//
	}
};
