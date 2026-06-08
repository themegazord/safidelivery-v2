<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * Adiciona CASCADE DELETE a item_preco.tamanho_id para permitir deleção em cascata
     * de categoria_tamanho quando um cardápio é deletado.
     *
     * Sem isso, a deleção de um cardápio falharia pois há ItemPreco dependentes.
     */
    public function up(): void
    {
        if (Schema::hasTable('item_preco')) {
            // Desabilitar foreign key checks temporariamente
            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            try {
                // Remover a constraint antiga (ON DELETE RESTRICT)
                DB::statement('ALTER TABLE item_preco DROP FOREIGN KEY item_preco_tamanho_id_foreign');

                // Adicionar a nova constraint com CASCADE DELETE
                DB::statement('ALTER TABLE item_preco ADD CONSTRAINT item_preco_tamanho_id_foreign
                    FOREIGN KEY (tamanho_id) REFERENCES categoria_tamanho(id) ON DELETE CASCADE');
            } finally {
                // Reabilitar foreign key checks
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('item_preco')) {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            try {
                // Reverter para ON DELETE RESTRICT
                DB::statement('ALTER TABLE item_preco DROP FOREIGN KEY item_preco_tamanho_id_foreign');

                DB::statement('ALTER TABLE item_preco ADD CONSTRAINT item_preco_tamanho_id_foreign
                    FOREIGN KEY (tamanho_id) REFERENCES categoria_tamanho(id) ON DELETE RESTRICT');
            } finally {
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            }
        }
    }
};
