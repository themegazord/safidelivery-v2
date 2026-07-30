<?php

namespace App\Actions\Categorias;

use App\Models\CategoriaBorda;
use App\Models\CategoriaMassa;
use App\Models\CategoriaTamanho;
use App\Traits\Categorias\ValidaExternalIdUnico;
use Exception;
use Symfony\Component\HttpFoundation\Response;

class UpdateCategoriaAction {
    use ValidaExternalIdUnico;
    public function handle(array $dados, int $categoria_id, int $cardapio_id) {
        if ($dados['tipo'] === 'P') {
            $conflito = $this->validarExternalIdUnicoParaEdicao(
                $dados['tamanhos'] ?? [],
                $dados['massas'] ?? [],
                $dados['bordas'] ?? [],
                $categoria_id,
                $cardapio_id
            );

            if ($conflito) {
                throw new Exception($conflito, Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        try {
            $categoria = \Illuminate\Support\Facades\DB::transaction(function () use ($categoria_id, $dados){
                $categoria = \App\Models\Categoria::query()->withTrashed()->findOrFail($categoria_id);

                $categoria->update([
                    'nome' => $dados['nome'],
                    'dias_funcionamento' => $dados['dias_funcionamento'],
                ]);

                if ($dados['tipo'] === 'P') {
                    // Sincroniza tamanhos (atualiza existentes, cria novos, remove ausentes)
                    $tamanhoIds = [];
                    foreach ($dados['tamanhos'] as $tamanho) {
                        if (!empty($tamanho['id'])) {
                            CategoriaTamanho::query()->findOrFail($tamanho['id'])->update([
                                ...$tamanho,
                            ]);
                            $tamanhoIds[] = $tamanho['id'];
                        } else {
                            $tamanhoIds[] = CategoriaTamanho::query()->create([
                                'categoria_id' => $categoria_id,
                                ...$tamanho,
                            ])->id;
                        }
                    }
                    CategoriaTamanho::query()
                        ->where('categoria_id', $categoria_id)
                        ->whereNotIn('id', $tamanhoIds)
                        ->delete();

                    // Sincroniza massas (atualiza existentes, cria novas, remove ausentes)
                    $massaIds = [];
                    foreach ($dados['massas'] as $massa) {
                        if (!empty($massa['id'])) {
                            CategoriaMassa::query()->findOrFail($massa['id'])->update([
                                ...$massa,
                            ]);
                            $massaIds[] = $massa['id'];
                        } else {
                            $massaIds[] = CategoriaMassa::query()->create([
                                'categoria_id' => $categoria_id,
                                ...$massa,
                            ])->id;
                        }
                    }
                    CategoriaMassa::query()
                        ->where('categoria_id', $categoria_id)
                        ->whereNotIn('id', $massaIds)
                        ->delete();

                    // Sincroniza bordas (atualiza existentes, cria novas, remove ausentes)
                    $bordaIds = [];
                    foreach ($dados['bordas'] as $borda) {
                        if (!empty($borda['id'])) {
                            CategoriaBorda::query()->findOrFail($borda['id'])->update([
                                ...$borda,
                            ]);
                            $bordaIds[] = $borda['id'];
                        } else {
                            $bordaIds[] = CategoriaBorda::query()->create([
                                'categoria_id' => $categoria_id,
                                ...$borda,
                            ])->id;
                        }
                    }
                    CategoriaBorda::query()
                        ->where('categoria_id', $categoria_id)
                        ->whereNotIn('id', $bordaIds)
                        ->delete();
                }

                return $categoria->fresh(['tamanhos', 'massas', 'bordas']);
            });
        } catch (\Exception $e) {
            throw new Exception('Não foi possivel realizar a atualização da categoria, por favor, entre em contato com o suporte.', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
