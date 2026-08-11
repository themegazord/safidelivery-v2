<?php

namespace App\Actions\GrupoComplementos;

use App\Models\ImportacaoComplementoIfood;
use App\Models\ImportacaoGrupoComplementoIfood;
use App\Models\Item;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CopiaGrupoComplementoAction
{
    public function handle(array $dados, string $categoria_id, string $item_id, bool $exportaDadosIfood)
    {
        try {
            $itemRemetente = Item::withTrashed()
                ->where('categoria_id', $dados['categoria_id'])
                ->where('id', $dados['item_id'])
                ->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Item de origem não encontrado, por favor, tente novamente.', Response::HTTP_NOT_FOUND, $mnfe);
        }

        try {
            $itemDestinatario = Item::withTrashed()
                ->where('categoria_id', $categoria_id)
                ->where('id', $item_id)
                ->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Item de destino não encontrado, por favor, tente novamente.', Response::HTTP_NOT_FOUND, $mnfe);
        }

        try {
            /**
             * @var \App\Models\GrupoComplemento $grupo
             */
            foreach ($itemRemetente->grupo_complemento as $grupo) {
                $grupoCopiado = $grupo->replicate()->fill([
                    'item_id' => $itemDestinatario->getAttribute('id')
                ]);

                $grupoCopiado->save();

                if ($exportaDadosIfood) {
                    ImportacaoGrupoComplementoIfood::query()->create([
                        'grupo_id' => $grupoCopiado->getAttribute('id'),
                        'option_group_id' => Str::uuid(),
                    ]);
                }

                /**
                 * @var \App\Models\Complemento $complemento
                 */
                foreach ($grupo->complementos as $complemento) {
                    $complementoCopiado = $complemento->replicate()->fill([
                        'grupo_id' => $grupoCopiado->getAttribute('id'),
                    ]);

                    $complementoCopiado->save();

                    if ($exportaDadosIfood) {
                        ImportacaoComplementoIfood::query()->create([
                            'complemento_id' => $complementoCopiado->getAttribute('id'),
                            'option_id' => Str::uuid(),
                            'product_id' => Str::uuid(),
                        ]);
                    }
                }
            }
        } catch (Exception $e) {
            throw new Exception('Ocorreu um erro ao tentar copiar o grupo de complemento do item, por favor, entre em contato com o suporte', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
