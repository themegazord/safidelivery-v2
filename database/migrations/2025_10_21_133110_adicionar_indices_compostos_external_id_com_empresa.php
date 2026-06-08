<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    // Nota: Esta migration adiciona índices compostos para garantir que external_id
    // seja único apenas dentro do contexto da empresa, não globalmente.
    // Isso resolve o problema onde diferentes empresas não podem usar o mesmo external_id.

    // Tabela: itens
    try {
      DB::statement('ALTER TABLE itens DROP INDEX itens_external_id_unique');
    } catch (\Exception $e) {
      // Índice não existe, continua
    }

    // Limpa duplicatas: Define external_id como NULL para registros duplicados (mantém apenas o mais antigo)
    $this->limparDuplicatasItens();

    if (!$this->indexExists('itens', 'itens_external_id_categoria_id_unique')) {
      Schema::table('itens', function (Blueprint $table) {
        $table->unique(['external_id', 'categoria_id'], 'itens_external_id_categoria_id_unique');
      });
    }

    // Tabela: categoria_tamanho
    try {
      DB::statement('ALTER TABLE categoria_tamanho DROP INDEX categoria_tamanho_external_id_unique');
    } catch (\Exception $e) {
      // Índice não existe, continua
    }

    $this->limparDuplicatasCatTamanho();

    if (!$this->indexExists('categoria_tamanho', 'categoria_tamanho_external_id_categoria_id_unique')) {
      Schema::table('categoria_tamanho', function (Blueprint $table) {
        $table->unique(['external_id', 'categoria_id'], 'categoria_tamanho_external_id_categoria_id_unique');
      });
    }

    // Tabela: categoria_massa
    try {
      DB::statement('ALTER TABLE categoria_massa DROP INDEX categoria_massa_external_id_unique');
    } catch (\Exception $e) {
      // Índice não existe, continua
    }

    $this->limparDuplicatasCatMassa();

    if (!$this->indexExists('categoria_massa', 'categoria_massa_external_id_categoria_id_unique')) {
      Schema::table('categoria_massa', function (Blueprint $table) {
        $table->unique(['external_id', 'categoria_id'], 'categoria_massa_external_id_categoria_id_unique');
      });
    }

    // Tabela: categoria_borda
    try {
      DB::statement('ALTER TABLE categoria_borda DROP INDEX categoria_borda_external_id_unique');
    } catch (\Exception $e) {
      // Índice não existe, continua
    }

    $this->limparDuplicatasCatBorda();

    if (!$this->indexExists('categoria_borda', 'categoria_borda_external_id_categoria_id_unique')) {
      Schema::table('categoria_borda', function (Blueprint $table) {
        $table->unique(['external_id', 'categoria_id'], 'categoria_borda_external_id_categoria_id_unique');
      });
    }

    // Tabela: complementos
    try {
      DB::statement('ALTER TABLE complementos DROP INDEX complementos_external_id_unique');
    } catch (\Exception $e) {
      // Índice não existe, continua
    }

    $this->limparDuplicatasComplementos();

    if (!$this->indexExists('complementos', 'complementos_external_id_grupo_id_unique')) {
      Schema::table('complementos', function (Blueprint $table) {
        $table->unique(['external_id', 'grupo_id'], 'complementos_external_id_grupo_id_unique');
      });
    }
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    if ($this->indexExists('itens', 'itens_external_id_categoria_id_unique')) {
      Schema::table('itens', function (Blueprint $table) {
        $table->dropUnique('itens_external_id_categoria_id_unique');
      });
    }

    if ($this->indexExists('categoria_tamanho', 'categoria_tamanho_external_id_categoria_id_unique')) {
      Schema::table('categoria_tamanho', function (Blueprint $table) {
        $table->dropUnique('categoria_tamanho_external_id_categoria_id_unique');
      });
    }

    if ($this->indexExists('categoria_massa', 'categoria_massa_external_id_categoria_id_unique')) {
      Schema::table('categoria_massa', function (Blueprint $table) {
        $table->dropUnique('categoria_massa_external_id_categoria_id_unique');
      });
    }

    if ($this->indexExists('categoria_borda', 'categoria_borda_external_id_categoria_id_unique')) {
      Schema::table('categoria_borda', function (Blueprint $table) {
        $table->dropUnique('categoria_borda_external_id_categoria_id_unique');
      });
    }

    if ($this->indexExists('complementos', 'complementos_external_id_grupo_id_unique')) {
      Schema::table('complementos', function (Blueprint $table) {
        $table->dropUnique('complementos_external_id_grupo_id_unique');
      });
    }
  }

  /**
   * Verifica se um índice existe usando query SQL direta
   */
  private function indexExists(string $table, string $index): bool
  {
    $database = DB::getDatabaseName();

    $result = DB::select(
      "SELECT COUNT(*) as count
       FROM information_schema.statistics
       WHERE table_schema = ?
       AND table_name = ?
       AND index_name = ?",
      [$database, $table, $index]
    );

    return $result[0]->count > 0;
  }

  /**
   * Limpa duplicatas na tabela itens
   * Define external_id como NULL para registros duplicados, mantendo apenas o mais antigo
   */
  private function limparDuplicatasItens(): void
  {
    // Primeiro, converte todos os external_id = 0 para NULL
    DB::statement("UPDATE itens SET external_id = NULL WHERE external_id = 0");

    // Define NULL para external_id que são duplicados (mantém apenas o registro com menor ID)
    DB::statement("
      UPDATE itens i1
      LEFT JOIN (
        SELECT MIN(id) as min_id, external_id, categoria_id
        FROM itens
        WHERE external_id IS NOT NULL
        GROUP BY external_id, categoria_id
        HAVING COUNT(*) > 1
      ) i2 ON i1.external_id = i2.external_id AND i1.categoria_id = i2.categoria_id
      SET i1.external_id = NULL
      WHERE i2.external_id IS NOT NULL AND i1.id != i2.min_id
    ");
  }

  /**
   * Limpa duplicatas na tabela categoria_tamanho
   */
  private function limparDuplicatasCatTamanho(): void
  {
    // Converte external_id = 0 para NULL
    DB::statement("UPDATE categoria_tamanho SET external_id = NULL WHERE external_id = 0");

    DB::statement("
      UPDATE categoria_tamanho ct1
      LEFT JOIN (
        SELECT MIN(id) as min_id, external_id, categoria_id
        FROM categoria_tamanho
        WHERE external_id IS NOT NULL
        GROUP BY external_id, categoria_id
        HAVING COUNT(*) > 1
      ) ct2 ON ct1.external_id = ct2.external_id AND ct1.categoria_id = ct2.categoria_id
      SET ct1.external_id = NULL
      WHERE ct2.external_id IS NOT NULL AND ct1.id != ct2.min_id
    ");
  }

  /**
   * Limpa duplicatas na tabela categoria_massa
   */
  private function limparDuplicatasCatMassa(): void
  {
    // Converte external_id = 0 para NULL
    DB::statement("UPDATE categoria_massa SET external_id = NULL WHERE external_id = 0");

    DB::statement("
      UPDATE categoria_massa cm1
      LEFT JOIN (
        SELECT MIN(id) as min_id, external_id, categoria_id
        FROM categoria_massa
        WHERE external_id IS NOT NULL
        GROUP BY external_id, categoria_id
        HAVING COUNT(*) > 1
      ) cm2 ON cm1.external_id = cm2.external_id AND cm1.categoria_id = cm2.categoria_id
      SET cm1.external_id = NULL
      WHERE cm2.external_id IS NOT NULL AND cm1.id != cm2.min_id
    ");
  }

  /**
   * Limpa duplicatas na tabela categoria_borda
   */
  private function limparDuplicatasCatBorda(): void
  {
    // Converte external_id = 0 para NULL
    DB::statement("UPDATE categoria_borda SET external_id = NULL WHERE external_id = 0");

    DB::statement("
      UPDATE categoria_borda cb1
      LEFT JOIN (
        SELECT MIN(id) as min_id, external_id, categoria_id
        FROM categoria_borda
        WHERE external_id IS NOT NULL
        GROUP BY external_id, categoria_id
        HAVING COUNT(*) > 1
      ) cb2 ON cb1.external_id = cb2.external_id AND cb1.categoria_id = cb2.categoria_id
      SET cb1.external_id = NULL
      WHERE cb2.external_id IS NOT NULL AND cb1.id != cb2.min_id
    ");
  }

  /**
   * Limpa duplicatas na tabela complementos
   */
  private function limparDuplicatasComplementos(): void
  {
    // Converte external_id = 0 para NULL
    DB::statement("UPDATE complementos SET external_id = NULL WHERE external_id = 0");

    DB::statement("
      UPDATE complementos c1
      LEFT JOIN (
        SELECT MIN(id) as min_id, external_id, grupo_id
        FROM complementos
        WHERE external_id IS NOT NULL
        GROUP BY external_id, grupo_id
        HAVING COUNT(*) > 1
      ) c2 ON c1.external_id = c2.external_id AND c1.grupo_id = c2.grupo_id
      SET c1.external_id = NULL
      WHERE c2.external_id IS NOT NULL AND c1.id != c2.min_id
    ");
  }
};
