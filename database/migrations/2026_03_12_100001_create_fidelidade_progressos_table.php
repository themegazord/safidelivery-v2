<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fidelidade_progressos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignId('empresa_id')->constrained('empresas')->cascadeOnDelete();
            $table->unsignedInteger('contador_atual')->default(0);
            $table->decimal('valor_acumulado', 10, 2)->default(0);
            $table->boolean('recompensa_disponivel')->default(false);
            $table->string('recompensa_tipo')->nullable();
            $table->decimal('recompensa_valor', 10, 2)->nullable();
            $table->date('recompensa_expira_em')->nullable();
            $table->timestamp('recompensa_usada_em')->nullable();
            $table->timestamps();

            $table->unique(['cliente_id', 'empresa_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fidelidade_progressos');
    }
};
