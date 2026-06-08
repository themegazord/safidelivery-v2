<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('financeiro_pedido', function (Blueprint $table) {
            $table->foreignId('forma_pagamento_id')
                ->nullable()
                ->after('forma_pagamento')
                ->constrained('forma_pagamento')
                ->nullOnDelete();
        });

        Schema::table('financeiro_pedido_pagamentos', function (Blueprint $table) {
            $table->foreignId('forma_pagamento_id')
                ->nullable()
                ->after('forma_pagamento')
                ->constrained('forma_pagamento')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('financeiro_pedido', function (Blueprint $table) {
            $table->dropForeign(['forma_pagamento_id']);
            $table->dropColumn('forma_pagamento_id');
        });

        Schema::table('financeiro_pedido_pagamentos', function (Blueprint $table) {
            $table->dropForeign(['forma_pagamento_id']);
            $table->dropColumn('forma_pagamento_id');
        });
    }
};
