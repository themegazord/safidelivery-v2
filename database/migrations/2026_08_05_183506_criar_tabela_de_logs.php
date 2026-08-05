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
        Schema::create('logs', function (Blueprint $table) {
            $table->uuid()->primary();
            $table->text('message');
            $table->string('cnpj')->nullable();
            $table->json('context');
            $table->dateTime('datetime');
            $table->json('extra');
            $table->integer('level');
            $table->string('level_name');
            $table->timestamps();

            $table->index(['cnpj', 'created_at']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};
