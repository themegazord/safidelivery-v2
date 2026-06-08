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
        Schema::create('financeiro_pedido_pagamentos', function (Blueprint $table) {
            $table->id();
            $table->string('financeiro_pedido_uuid');
            $table->foreign('financeiro_pedido_uuid')->references('uuid')->on('financeiro_pedido')->cascadeOnDelete();
            $table->string('forma_pagamento', 30);
            $table->float('valor');
            $table->float('troco_para')->nullable();
            $table->float('valor_troco')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financeiro_pedido_pagamentos');
    }
};
