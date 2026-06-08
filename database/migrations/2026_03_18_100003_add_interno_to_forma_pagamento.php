<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('forma_pagamento', function (Blueprint $table) {
            $table->boolean('interno')->default(false)->after('tipo');
        });
    }

    public function down(): void
    {
        Schema::table('forma_pagamento', function (Blueprint $table) {
            $table->dropColumn('interno');
        });
    }
};
