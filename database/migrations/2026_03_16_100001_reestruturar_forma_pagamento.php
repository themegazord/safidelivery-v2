<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        $tipoMap = [
            'pix'            => 'PIX',
            'dinheiro'       => 'DIN',
            'master_debito'  => 'CTD',
            'visa_debito'    => 'CTD',
            'elo_debito'     => 'CTD',
            'master_credito' => 'CTC',
            'elo_credito'    => 'CTC',
            'visa_credito'   => 'CTC',
            'amex_credito'   => 'CTC',
            'vr_refeicao'    => 'VRE',
            'alelo_refeicao' => 'VRE',
            'outro_refeicao' => 'VRE',
        ];

        $labelMap = [
            'pix'            => 'Pix',
            'dinheiro'       => 'Dinheiro',
            'master_debito'  => 'Mastercard - Débito',
            'visa_debito'    => 'Visa - Débito',
            'elo_debito'     => 'Elo - Débito',
            'master_credito' => 'Mastercard - Crédito',
            'elo_credito'    => 'Elo - Crédito',
            'visa_credito'   => 'Visa - Crédito',
            'amex_credito'   => 'Amex - Crédito',
            'vr_refeicao'    => 'VR Refeição',
            'alelo_refeicao' => 'Alelo',
            'outro_refeicao' => 'Outro ticket refeição',
        ];

        // Captura dados existentes antes de recriar a tabela
        $registros = DB::table('forma_pagamento')->get();

        Schema::drop('forma_pagamento');

        Schema::create('forma_pagamento', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas');
            $table->integer('codigo_pdv')->nullable();
            $table->string('descricao', 100);
            $table->string('tipo', 3);
            $table->softDeletes();
            $table->timestamps();
        });

        // Migra dados existentes
        $now = now();
        foreach ($registros as $registro) {
            $formas = json_decode($registro->formas, true) ?? [];
            foreach ($formas as $forma) {
                DB::table('forma_pagamento')->insert([
                    'empresa_id'  => $registro->empresa_id,
                    'codigo_pdv'  => null,
                    'descricao'   => $labelMap[$forma] ?? $forma,
                    'tipo'        => $tipoMap[$forma] ?? 'DIN',
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::drop('forma_pagamento');

        Schema::create('forma_pagamento', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas');
            $table->json('formas');
            $table->timestamps();
        });
    }
};
