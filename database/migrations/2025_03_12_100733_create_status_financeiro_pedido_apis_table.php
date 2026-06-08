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
    Schema::table('financeiro_pedido', function (Blueprint $table) {
      $table->uuid()->unique()->change();
    });
    Schema::create('status_financeiro_pedido_api', function (Blueprint $table) {
      $table->id();
      $table->foreignUuid('financeiro_pedido_id')->constrained('financeiro_pedido', 'uuid')->cascadeOnDelete();
      $table->string('status');
      $table->text('url_qrcode_pix')->nullable();
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('status_financeiro_pedido_api');
    Schema::table('financeiro_pedido', function (Blueprint $table) {
      $table->dropUnique('financeiro_pedido_uuid_unique');
    });
  }
};
