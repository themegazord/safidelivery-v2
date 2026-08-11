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
        Schema::create('complemento_cross_sell', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('grupo_id');
            $table->integer('external_id');
            $table->string('nome');
            $table->text('imagem');
            $table->float('preco');
            $table->timestamps();

            $table->foreign('grupo_id')->references('id')->on('grupo_complemento')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complemento_cross_sell');
    }
};
