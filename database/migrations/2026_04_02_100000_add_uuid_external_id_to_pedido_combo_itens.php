<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedido_combo_itens', function (Blueprint $table) {
            $table->string('uuid')->nullable()->after('pedido_item_id');
            $table->string('external_id')->nullable()->after('uuid');
        });
    }

    public function down(): void
    {
        Schema::table('pedido_combo_itens', function (Blueprint $table) {
            $table->dropColumn(['uuid', 'external_id']);
        });
    }
};
