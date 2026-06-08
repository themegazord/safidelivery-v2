<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('financeiro_pedido', function (Blueprint $table) {
            $table->string('forma_pagamento', 50)->nullable()->change();
        });

        Schema::table('financeiro_pedido_pagamentos', function (Blueprint $table) {
            $table->string('forma_pagamento', 50)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('financeiro_pedido', function (Blueprint $table) {
            $table->string('forma_pagamento', 20)->nullable(false)->change();
        });

        Schema::table('financeiro_pedido_pagamentos', function (Blueprint $table) {
            $table->string('forma_pagamento', 30)->nullable(false)->change();
        });
    }
};
