<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('imagens_temporarias', function (Blueprint $table) {
            $table->id();
            $table->string('bucket_key');
            $table->string('url');
            $table->foreignId('item_id')->nullable()->constrained('itens')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('imagens_temporarias');
    }
};
