<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->foreignId('endereco_entrega_id')
                ->nullable()
                ->after('valor_frete')
                ->constrained('enderecos');
        });

        // Repopula pedidos de delivery existentes com o endereço principal atual do cliente
        DB::table('pedidos')
            ->where('tipo', 'D')
            ->whereNull('endereco_entrega_id')
            ->whereNotNull('cliente_id')
            ->chunkById(200, function ($pedidos) {
                foreach ($pedidos as $pedido) {
                    // Tenta o endereço marcado como principal; se não houver, pega o primeiro
                    $enderecoId = DB::table('cliente_endereco')
                        ->where('cliente_id', $pedido->cliente_id)
                        ->where('principal', true)
                        ->value('endereco_id')
                        ?? DB::table('cliente_endereco')
                            ->where('cliente_id', $pedido->cliente_id)
                            ->value('endereco_id');

                    if ($enderecoId) {
                        DB::table('pedidos')
                            ->where('id', $pedido->id)
                            ->update(['endereco_entrega_id' => $enderecoId]);
                    }
                }
            });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropForeign(['endereco_entrega_id']);
            $table->dropColumn('endereco_entrega_id');
        });
    }
};
