<?php

use App\Models\Empresa;
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
        Schema::create('cashback_configs', function (Blueprint $table) {
            $table->id();
						$table->foreignIdFor(Empresa::class)->constrained('empresas')->cascadeOnDelete();
						$table->float('cashback_porcentagem')->nullable();
						$table->float('cashback_fixo')->nullable();
						$table->enum('cashback_tipo', ['porcentagem', 'fixo']);
						$table->boolean('status')->default(false);
						$table->integer('dias_validade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cashback_configs');
    }
};
