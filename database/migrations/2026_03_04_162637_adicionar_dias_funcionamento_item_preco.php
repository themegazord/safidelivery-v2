<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
			Schema::table('item_preco', function (Blueprint $table) {
            $table->json('dias_funcionamento')->nullable()->after('classificacao');
        });

				DB::table('item_preco')->update(['dias_funcionamento' => '["0", 1, 2, 5, 4, 3, 6]']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_preco', function (Blueprint $table) {
            $table->dropColumn('dias_funcionamento');
        });
    }
};
