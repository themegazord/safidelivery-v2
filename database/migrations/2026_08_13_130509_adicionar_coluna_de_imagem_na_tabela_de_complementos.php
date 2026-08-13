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
        Schema::table('complementos', function (Blueprint $table) {
            if (!Schema::hasColumn('complementos', 'imagem')) {
                $table->text('imagem')->nullable()->after('nome');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complementos', function (Blueprint $table) {
            if (!Schema::hasColumn('complementos', 'imagem')) {
                $table->dropColumn('imagem');
            }
        });
    }
};
