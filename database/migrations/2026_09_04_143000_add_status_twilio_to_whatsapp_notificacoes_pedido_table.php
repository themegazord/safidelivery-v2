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
        Schema::table('whatsapp_notificacoes_pedido', function (Blueprint $table) {
            $table->string('status_twilio')->nullable()->after('twilio_message_sid');
            $table->string('erro_codigo')->nullable()->after('erro');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whatsapp_notificacoes_pedido', function (Blueprint $table) {
            $table->dropColumn(['status_twilio', 'erro_codigo']);
        });
    }
};
