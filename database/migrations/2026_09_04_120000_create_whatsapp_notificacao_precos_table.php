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
        Schema::create('whatsapp_notificacao_precos', function (Blueprint $table) {
            $table->id();
            $table->decimal('preco_usd', 10, 4);
            $table->date('vigente_a_partir_de');
            $table->string('observacao')->nullable();
            $table->timestamps();
        });

        // Valores iniciais de exemplo. Preço só muda inserindo uma nova linha
        // diretamente no banco — não existe tela de edição para esta tabela.
        DB::table('whatsapp_notificacao_precos')->insert([
            [
                'preco_usd' => 0.1500,
                'vigente_a_partir_de' => '2026-09-04',
                'observacao' => 'Valor inicial de referência',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'preco_usd' => 0.1000,
                'vigente_a_partir_de' => '2026-09-15',
                'observacao' => 'Ajuste de referência',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_notificacao_precos');
    }
};
