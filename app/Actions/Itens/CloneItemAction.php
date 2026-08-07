<?php

namespace App\Actions\Itens;

use App\Models\Categoria;
use App\Models\Combo;
use App\Models\Empresa;
use App\Models\Item;
use App\Services\IFOOD\ApiExternalIfood;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CloneItemAction
{
    public function handle(string $item_id, bool $exportaDadosIfood, Empresa $empresa, Categoria $categoriaAtual)
    {
        try {
            $itemAtual = Item::query()->where('categoria_id', $categoriaAtual->getAttribute('id'))->where('id', $item_id)->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Item não encontrado, por favor, tente novamente.', Response::HTTP_NOT_FOUND, $mnfe);
        }

        if ($itemAtual->getAttribute('tipo') === 'CON') {
            $this->duplicarCombo($itemAtual);
            return;
        }

        try {
            $itemDuplicado = $itemAtual->replicate();

            // Ao duplicar, será retirado o external_id por conta das validações
            $itemDuplicado->external_id = null;

            $itemDuplicado->save();

            if ($exportaDadosIfood) {
                $itemDuplicado->itemIfood()->create([
                    'item_id' => $itemDuplicado->getAttribute('id'),
                    'item_ifood_id' => Str::uuid(),
                    'product_id' => Str::uuid(),
                ]);

                $api = app(ApiExternalIfood::class);

                $api->upsertItem($empresa, $itemDuplicado);
            }

            $gruposComplemento = $itemAtual->getAttribute('grupo_complemento');

            if ($itemAtual->getAttribute('tipo') === 'PRE' && $gruposComplemento->isNotEmpty()) {
                foreach ($gruposComplemento as $grupo) {

                    $grupoDuplicado = $grupo->replicate()->fill([
                        'item_id' => $itemDuplicado->id,
                    ]);

                    $grupoDuplicado->save();

                    if (! $grupo->complementos->isEmpty()) {
                        foreach ($grupo->complementos as $complemento) {
                            $complementoDuplicado = $complemento->replicate()->fill([
                                'grupo_id' => $grupoDuplicado->id,
                            ]);

                            $complementoDuplicado->save();
                        }
                    }
                }
            }

            if ($categoriaAtual->tipo === 'P') {
                foreach ($itemAtual->getAttribute('precosItemPizza') as $preco) {
                    $precoDuplicado = $preco->replicate()->fill([
                        'item_id' => $itemDuplicado->id,
                    ]);
                    $precoDuplicado->save();
                }
            }
        } catch (Exception $e) {
            throw new Exception('Ocorreu um problema ao tentar clonar o item, por favor, entrar em contato com o suporte', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public function duplicarCombo(Item $itemAtual): void
    {
        $combo = Combo::with(['meta', 'grupos.entradas'])->withoutGlobalScope('combo')->findOrFail($itemAtual->getAttribute('id'));

        try {
            DB::transaction(function () use ($combo) {
                $comboDuplicado = $combo->replicate(['external_id']);
                $comboDuplicado->save();

                if ($combo->meta) {
                    $comboDuplicado->meta()->create([
                        'tipo_precificacao' => $combo->meta->tipo_precificacao,
                        'preco_combo' => $combo->meta->preco_combo,
                        'desconto_combo' => $combo->meta->desconto_combo,
                    ]);
                }

                foreach ($combo->grupos as $grupo) {
                    $grupoDuplicado = $comboDuplicado->grupos()->create([
                        'nome' => $grupo->nome,
                        'qtd_maxima' => $grupo->qtd_maxima,
                        'ordem' => $grupo->ordem,
                        'configuracao' => $grupo->configuracao,
                    ]);

                    foreach ($grupo->entradas as $entrada) {
                        $comboDuplicado->entradas()->create([
                            'tipo' => $entrada->tipo,
                            'combo_grupo_id' => $grupoDuplicado->id,
                            'grupo_complemento_id' => $entrada->grupo_complemento_id,
                            'referencia_id' => $entrada->referencia_id,
                            'nome_snapshot' => $entrada->nome_snapshot,
                            'preco_snapshot' => $entrada->preco_snapshot,
                        ]);
                    }
                }
            });
        } catch (Exception $e) {
            throw new Exception('Ocorreu um problema ao tentar clonar o combo, por favor, entre em contato com o suporte', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
