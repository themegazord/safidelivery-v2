<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('mensagens', function (Blueprint $table) {
      $table->uuid()->primary();
      $table->foreignId('chat_id')->constrained('chats', 'id')->cascadeOnDelete();
      $table->foreignId('usuario_id')->constrained('users', 'id');
      $table->text('mensagem');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('mensagens');
  }
};
