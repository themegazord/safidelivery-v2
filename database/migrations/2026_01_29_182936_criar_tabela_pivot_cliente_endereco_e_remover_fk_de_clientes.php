<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	/**
	 * Run the migrations.
	 */
	public function up(): void
	{
		// 1. Criar tabela pivot
		Schema::create('cliente_endereco', function (Blueprint $table) {
			$table->id();
			$table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
			$table->foreignId('endereco_id')->constrained('enderecos')->cascadeOnDelete();
			$table->boolean('principal')->default(false);
			$table->timestamps();

			$table->unique(['cliente_id', 'endereco_id']);
		});

		// 2. Migrar dados existentes para a tabela pivot
		DB::statement("
            INSERT INTO cliente_endereco (cliente_id, endereco_id, principal, created_at, updated_at)
            SELECT id, endereco_id, true, NOW(), NOW()
            FROM clientes
            WHERE endereco_id IS NOT NULL
        ");

		// 3. Remover a foreign key e coluna endereco_id de clientes
		Schema::table('clientes', function (Blueprint $table) {
			$table->dropForeign(['endereco_id']);
			$table->dropColumn('endereco_id');
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		// 1. Recriar coluna endereco_id em clientes
		Schema::table('clientes', function (Blueprint $table) {
			$table->foreignId('endereco_id')->nullable()->after('id')->constrained('enderecos')->nullOnDelete();
		});

		// 2. Migrar dados de volta (pegar o endereço principal, ou o primeiro se não houver principal)
		$enderecos = DB::table('cliente_endereco')
			->select('cliente_id', 'endereco_id')
			->where('principal', true)
			->get();

		// Para clientes sem endereço principal, pegar o primeiro
		$clientesSemPrincipal = DB::table('cliente_endereco')
			->select('cliente_id', DB::raw('MIN(endereco_id) as endereco_id'))
			->whereNotIn('cliente_id', $enderecos->pluck('cliente_id'))
			->groupBy('cliente_id')
			->get();

		$enderecos = $enderecos->merge($clientesSemPrincipal);

		foreach ($enderecos as $endereco) {
			DB::table('clientes')
				->where('id', $endereco->cliente_id)
				->update(['endereco_id' => $endereco->endereco_id]);
		}

		// 3. Remover tabela pivot
		Schema::dropIfExists('cliente_endereco');
	}
};
