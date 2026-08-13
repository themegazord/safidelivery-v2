<?php

namespace App\Actions\GrupoComplementos;

use App\Models\GrupoComplemento;
use App\Models\ImportacaoComplementoIfood;
use App\Models\ImportacaoGrupoComplementoIfood;
use App\Models\Item;
use Illuminate\Support\Str;

class CopiaGruposComplementoSelecionadosAction
{
    public function handle(array $grupos, Item $itemDestinatario, bool $exportaDadosIfood): void
    {
        $configuracaoPorGrupoId = collect($grupos)->keyBy('id');

        $gruposOriginais = GrupoComplemento::query()->with('complementos')->whereIn('id', $configuracaoPorGrupoId->keys())->get();

        /** @var GrupoComplemento $grupo */
        foreach ($gruposOriginais as $grupo) {
            $configuracao = $configuracaoPorGrupoId->get($grupo->getAttribute('id'));

            $grupoCopiado = $grupo->replicate()->fill([
                'item_id' => $itemDestinatario->getAttribute('id'),
                'obrigatoriedade' => $configuracao['obrigatoriedade'],
                'qtd_minima' => $configuracao['qtd_minima'],
                'qtd_maxima' => $configuracao['qtd_maxima'],
            ]);

            $grupoCopiado->save();

            if ($exportaDadosIfood) {
                ImportacaoGrupoComplementoIfood::query()->create([
                    'grupo_id' => $grupoCopiado->getAttribute('id'),
                    'option_group_id' => Str::uuid(),
                ]);
            }

            /** @var \App\Models\Complemento $complemento */
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
    }
}
