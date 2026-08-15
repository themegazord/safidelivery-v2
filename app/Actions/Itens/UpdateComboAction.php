<?php

namespace App\Actions\Itens;

use App\Models\Cardapio;
use App\Models\Combo;
use App\Models\ImagemTemporaria;
use Exception;
use Illuminate\Support\Facades\DB;

class UpdateComboAction
{
    public function handle(array $dados, Cardapio $cardapio, int $categoria_id, int $combo_id, StoreComboAction $storeComboAction): Combo
    {
        try {
            return DB::transaction(function () use ($dados, $cardapio, $categoria_id, $combo_id, $storeComboAction) {
                /** @var Combo $combo */
                $combo = Combo::query()->where('categoria_id', $categoria_id)->findOrFail($combo_id);

                $combo->update([
                    'categoria_id' => $dados['categoria_id'] ?? $combo->getAttribute('categoria_id'),
                    'nome' => $dados['nome'],
                    'external_id' => $dados['external_id'] ?? null,
                    'descricao' => $dados['descricao'] ?? null,
                    'tipo_preco' => $dados['tipo_preco'],
                    'imagem' => $dados['imagem'] ?? null,
                    'classificacao' => $storeComboAction->classificacaoLimpa($dados['classificacao'] ?? []),
                    'dias_funcionamento' => $dados['dias_funcionamento'] ?? [],
                ]);

                $combo->meta()->updateOrCreate([], [
                    'tipo_precificacao' => $dados['tipo_preco'],
                    'preco_combo' => $dados['meta']['preco_combo'] ?? null,
                    'desconto_combo' => $dados['meta']['desconto_combo'] ?? null,
                ]);

                // Reenvia o estado completo dos grupos/entradas a cada edição — mais
                // simples que fazer diff, e seguro porque pedido_combo_itens guarda
                // snapshot próprio (referencia_id pro Item/Complemento original), sem
                // FK pra combo_entradas.
                $combo->entradas()->delete();
                $combo->grupos()->delete();

                $storeComboAction->criaGrupos($combo, $cardapio, $dados['grupos'] ?? []);
                $storeComboAction->criaEntradasComplemento($combo, $cardapio, $dados['grupos_complemento'] ?? []);

                if (! empty($dados['imagem'])) {
                    ImagemTemporaria::query()->where('url', $dados['imagem'])->delete();
                }

                return $combo->fresh(['meta', 'grupos.entradas', 'entradasComplementos']);
            });
        } catch (Exception $e) {
            throw new Exception('Tivemos problemas ao editar esse combo, por favor, entre em contato com o suporte.', $e->getCode(), $e);
        }
    }
}
