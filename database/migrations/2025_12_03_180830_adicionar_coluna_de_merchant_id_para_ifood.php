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
    Schema::table('integracoes', function (Blueprint $table) {
      $table->string('merchantId', 40)->after('clientSecret');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('integracoes', function (Blueprint $table) {
      $table->dropColumn('merchantId');
    });
  }
};
