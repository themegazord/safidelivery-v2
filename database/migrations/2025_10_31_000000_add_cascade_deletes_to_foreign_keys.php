<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * Esta migration adiciona cascadeOnDelete() para relacionamentos que não possuem
     * comportamento de deleção adequado.
     *
     * Problemas identificados e corrigidos:
     * 1. pedidos.empresa_id - CRÍTICO: Deletar empresa deixaria pedidos órfãos
     * 2. mesas.empresa_id - CRÍTICO: Mesas órfãs
     * 3. promocao.empresa_id - CRÍTICO: Promoções órfãs
     * 4. configuracoes.empresa_id - CRÍTICO: Configurações órfãs
     * 5. notificacoes.empresa_id - CRÍTICO: Notificações órfãs
     * 6. justificativa_cancelamento_pedidos.pedido_id - CRÍTICO: Justificativas órfãs
     * 7. clientes.endereco_id - MODERADO: Clientes sem endereço
     * 8. item_preco.tamanho_id - MODERADO: Preços sem tamanho
     */
    public function up(): void
    {
        // Disable foreign key checks temporarily to avoid conflicts
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        try {
            // 1. pedidos.empresa_id - Adicionar CASCADE DELETE
            $this->addCascadeDeleteToFK('pedidos', 'empresa_id', 'empresas', 'pedidos_empresa_id_foreign');

            // 2. mesas.empresa_id - Adicionar CASCADE DELETE
            $this->addCascadeDeleteToFK('mesas', 'empresa_id', 'empresas', 'mesas_empresa_id_foreign');

            // 3. promocao.empresa_id - Adicionar CASCADE DELETE
            $this->addCascadeDeleteToFK('promocao', 'empresa_id', 'empresas', 'promocao_empresa_id_foreign');

            // 4. configuracoes.empresa_id - Adicionar CASCADE DELETE
            if (Schema::hasTable('configuracoes')) {
                $this->addCascadeDeleteToFK('configuracoes', 'empresa_id', 'empresas', 'configuracoes_empresa_id_foreign');
            }

            // 5. notificacoes.empresa_id - Adicionar CASCADE DELETE
            if (Schema::hasTable('notificacoes')) {
                $this->addCascadeDeleteToFK('notificacoes', 'empresa_id', 'empresas', 'notificacoes_empresa_id_foreign');
            }

            // 6. justificativa_cancelamento_pedidos.pedido_id - Adicionar CASCADE DELETE
            if (Schema::hasTable('justificativa_cancelamento_pedidos')) {
                $this->addCascadeDeleteToFK('justificativa_cancelamento_pedidos', 'pedido_id', 'pedidos', 'justificativa_cancelamento_pedidos_pedido_id_foreign');
            }
        } finally {
            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }

        // 7. OPCIONAL: Adicionar cascade delete a clientes.endereco_id
        // Descomentar se desejar aplicar.
        /*
        if (Schema::hasTable('clientes')) {
            $this->addCascadeDeleteToFK('clientes', 'endereco_id', 'enderecos', 'clientes_endereco_id_foreign');
        }
        */

        // 8. OPCIONAL: Adicionar cascade delete a item_preco.tamanho_id
        // Descomentar com cuidado se desejar aplicar.
        /*
        if (Schema::hasTable('item_preco')) {
            $this->addCascadeDeleteToFK('item_preco', 'tamanho_id', 'categoria_tamanho', 'item_preco_tamanho_id_foreign');
        }
        */
    }

    /**
     * Helper para adicionar CASCADE DELETE a uma FK
     */
    private function addCascadeDeleteToFK(string $table, string $column, string $references, string $constraintName): void
    {
        // Tentar dropar a constraint antiga (se existir)
        try {
            DB::statement("ALTER TABLE $table DROP FOREIGN KEY $constraintName");
        } catch (\Exception) {
            // Ignorar erro se constraint não existir
        }

        // Adicionar a nova constraint com CASCADE DELETE
        DB::statement("ALTER TABLE $table ADD CONSTRAINT $constraintName
            FOREIGN KEY ($column) REFERENCES $references(id) ON DELETE CASCADE");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverter cascadeOnDelete para comportamento original
        // Nota: Esta é uma operação destrutiva. O comportamento original exato não pode ser recuperado sem mais contexto.

        // 1. Reverter pedidos.empresa_id
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('empresa_id');
            $table->foreignId('empresa_id')
                ->after('cliente_id')
                ->constrained('empresas', 'id');
        });

        // 2. Reverter mesas.empresa_id
        Schema::table('mesas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('empresa_id');
            $table->foreignId('empresa_id')
                ->after('id')
                ->constrained('empresas', 'id');
        });

        // 3. Reverter promocao.empresa_id
        Schema::table('promocao', function (Blueprint $table) {
            $table->dropConstrainedForeignId('empresa_id');
            $table->foreignId('empresa_id')
                ->after('id')
                ->constrained('empresas', 'id');
        });

        // 4. Reverter configuracoes.empresa_id
        if (Schema::hasTable('configuracoes')) {
            Schema::table('configuracoes', function (Blueprint $table) {
                $table->dropConstrainedForeignId('empresa_id');
                $table->foreignId('empresa_id')
                    ->after('id')
                    ->constrained('empresas', 'id');
            });
        }

        // 5. Reverter notificacoes.empresa_id
        if (Schema::hasTable('notificacoes')) {
            Schema::table('notificacoes', function (Blueprint $table) {
                $table->dropConstrainedForeignId('empresa_id');
                $table->foreignId('empresa_id')
                    ->after('id')
                    ->constrained('empresas', 'id');
            });
        }

        // 6. Reverter justificativa_cancelamento_pedidos.pedido_id
        if (Schema::hasTable('justificativa_cancelamento_pedidos')) {
            Schema::table('justificativa_cancelamento_pedidos', function (Blueprint $table) {
                $table->dropConstrainedForeignId('pedido_id');
                $table->foreignId('pedido_id')
                    ->after('id')
                    ->constrained('pedidos', 'id');
            });
        }
    }
};
