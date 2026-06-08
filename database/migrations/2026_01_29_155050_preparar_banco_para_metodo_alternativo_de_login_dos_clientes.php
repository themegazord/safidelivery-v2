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
		Schema::table('users', function (Blueprint $table) {
			$table->string('email')->nullable()->change();
			$table->string('password')->nullable()->change();
		});
		Schema::table('clientes', function (Blueprint $table) {
			$table->foreignId('endereco_id')->nullable()->change();
			$table->string('email')->nullable()->change();
			$table->string('cpf_cnpj')->nullable()->change();
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
