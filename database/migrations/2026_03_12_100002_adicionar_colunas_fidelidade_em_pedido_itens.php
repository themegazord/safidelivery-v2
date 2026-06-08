<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedido_itens', function (Blueprint $table) {
            $table->boolean('item_premio')->default(false)->after('observacao');
            $table->decimal('preco_original', 10, 2)->nullable()->after('item_premio');
        });
    }

    public function down(): void
    {
        Schema::table('pedido_itens', function (Blueprint $table) {
            $table->dropColumn(['item_premio', 'preco_original']);
        });
    }
};
