<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fidelidade_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->cascadeOnDelete();
            $table->boolean('ativo')->default(false);
            $table->enum('tipo_gatilho', ['qtd_pedidos', 'valor_acumulado']);
            $table->decimal('valor_gatilho', 10, 2);
            $table->enum('tipo_recompensa', ['item_gratis', 'frete_gratis', 'desconto_percentual', 'desconto_fixo']);
            $table->decimal('valor_recompensa', 10, 2)->nullable();
            $table->decimal('valor_max_premio', 10, 2)->nullable();
            $table->json('categorias_bloqueadas')->nullable();
            $table->unsignedInteger('validade_dias')->nullable();
            $table->timestamps();

            $table->unique('empresa_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fidelidade_configs');
    }
};
