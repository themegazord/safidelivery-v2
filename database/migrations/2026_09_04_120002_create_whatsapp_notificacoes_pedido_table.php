<?php

use App\Models\Cliente;
use App\Models\Empresa;
use App\Models\Pedido;
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
        Schema::create('whatsapp_notificacoes_pedido', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Empresa::class)->constrained('empresas')->cascadeOnDelete();
            $table->foreignIdFor(Pedido::class)->constrained('pedidos')->cascadeOnDelete();
            $table->foreignIdFor(Cliente::class)->nullable()->constrained('clientes')->nullOnDelete();
            $table->string('telefone_destino');
            $table->string('status_pedido', 50);
            $table->text('mensagem');
            $table->string('twilio_message_sid')->nullable();
            $table->boolean('sucesso')->default(false);
            $table->text('erro')->nullable();
            $table->decimal('preco_usd', 10, 4)->nullable();
            $table->timestamp('enviado_em')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_notificacoes_pedido');
    }
};
