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
    DB::statement('ALTER TABLE pedidos AUTO_INCREMENT 1000');
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('pedidos', function (Blueprint $table) {
      DB::statement('ALTER TABLE pedidos AUTO_INCREMENT 1');
    });
  }
};
