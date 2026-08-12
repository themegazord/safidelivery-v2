<?php

namespace App\Actions\GrupoComplementos;

use App\Models\Cardapio;
use App\Models\Complemento;
use App\Models\GrupoComplemento;
use App\Models\ImportacaoComplementoIfood;
use App\Models\ImportacaoGrupoComplementoIfood;
use App\Models\Item;
use App\Traits\Categorias\ValidaExternalIdUnico;
use Exception;
use Str;
use Symfony\Component\HttpFoundation\Response;

class StoreGrupoComplementoAction {
    use ValidaExternalIdUnico;
    public function handle(array $grupoComplemento, Cardapio $cardapio, Item $itemAtual, bool $exportaDadosIfood ) {
        $conflito = $this->validarExternalIdComplementos($grupoComplemento['complementos'], $cardapio->getAttribute('id'));

        if ($conflito) {
            throw new Exception($conflito, Response::HTTP_BAD_REQUEST);
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($grupoComplemento, $itemAtual, $exportaDadosIfood) {
                $grupo = GrupoComplemento::query()->create([
                    'item_id' => $itemAtual->getAttribute('id'),
                    'nome' => $grupoComplemento['nome'],
                    'obrigatoriedade' => $grupoComplemento['obrigatoriedade'],
                    'qtd_minima' => $grupoComplemento['qtd_minima'],
                    'qtd_maxima' => $grupoComplemento['qtd_maxima'],
                ]);

                if ($exportaDadosIfood) {
                    ImportacaoGrupoComplementoIfood::query()->create([
                        'grupo_id' => $grupo->getAttribute('id'),
                        'option_group_id' => Str::uuid(),
                    ]);
                }

                foreach ($grupoComplemento['complementos'] as $complemento) {
                    // Normaliza o preço: substitui vírgula por ponto e garante formato decimal
                    $precoNormalizado = \is_string($complemento['preco'])
                      ? str_replace(',', '.', $complemento['preco'])
                      : $complemento['preco'];
                    $precoNormalizado = number_format(\floatval($precoNormalizado), 2, '.', '');

                    $complementoCriado = Complemento::query()->create([
                        'external_id' => $complemento['external_id'],
                        'imagem' => $complemento['imagem'],
                        'grupo_id' => $grupo->id,
                        'nome' => $complemento['nome'],
                        'descricao' => $complemento['descricao'],
                        'preco' => $precoNormalizado,
                        'status' => $complemento['status'],
                    ]);

                    if ($exportaDadosIfood) {
                        ImportacaoComplementoIfood::query()->create([
                            'complemento_id' => $complementoCriado->getAttribute('id'),
                            'option_id' => Str::uuid(),
                            'product_id' => Str::uuid(),
                        ]);
                    }
                }
            });
        } catch (\Exception $e) {
            throw new Exception('Ocorreu um problema ao tentar cadastrar grupo de complemento ou complemento, por favor, entre em contato com o suporte', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
