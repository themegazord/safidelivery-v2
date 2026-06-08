<?php

use App\Models\Cliente;
use App\Models\Empresa;
use App\Models\Pedido;
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
		Schema::create('cashback_creditos', function (Blueprint $table) {
			$table->id();
			$table->foreignIdFor(Empresa::class)->constrained('empresas')->cascadeOnDelete();
			$table->foreignIdFor(Cliente::class)->constrained('clientes')->cascadeOnDelete();
			$table->foreignIdFor(Pedido::class)->unique()->constrained('pedidos')->cascadeOnDelete();
			$table->float('credito_gerado');
			$table->dateTime('data_gerado');
			$table->dateTime('data_vencimento');
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('cashback_creditos');
	}
};
