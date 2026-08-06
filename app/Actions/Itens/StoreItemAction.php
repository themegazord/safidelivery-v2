<?php

namespace App\Actions\Itens;

use App\Models\Categoria;
use App\Models\Empresa;
use App\Models\ImagemTemporaria;
use App\Models\ImportacaoItemIfood;
use App\Models\Item;
use App\Models\ItemPreco;
use App\Services\IFOOD\ApiExternalIfood;
use App\Traits\Categorias\ValidaExternalIdUnico;
use Exception;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Str;

class StoreItemAction
{
    use ValidaExternalIdUnico;
    public function handle(array $item, int $cardapio_id, Categoria $categoria, bool $exportaDadosIfood, Empresa $empresa) {
        if (! empty($item['external_id'])) {
            $conflito = $this->validarExternalIdItem($item['external_id'], $item['nome'], $cardapio_id);

            if ($conflito) {
                throw new Exception($conflito, Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($categoria, $item, $exportaDadosIfood, $empresa) {
                    if ($categoria->tipo === 'I') {

                        $item['tipo_preco'] = 'fixo';

                        /**
                         * @var \App\Models\Item $itemCriado
                         */
                        $itemCriado = null;

                        if ($item['tipo'] === 'PRE') {
                            $item['tipo'] = 'PRE';

                            $itemCriado = Item::create([
                                'external_id' => $item['external_id'] ?? null,
                                'categoria_id' => $item['categoria_id'] ?? null,
                                'nome' => $item['nome'],
                                'preco' => $item['preco'] ?? null,
                                'desconto' => $item['desconto'] ?? false,
                                'valor_desconto' => $item['valor_desconto'] ?? null,
                                'porcentagem_desconto' => $item['porcentagem_desconto'] ?? null,
                                'tipo' => $item['tipo'],
                                'descricao' => $item['descricao'] ?? null,
                                'tipo_preco' => $item['tipo_preco'],
                                'qtde_pessoas' => $item['qtde_pessoas'] ?? null,
                                'peso' => $item['peso'] ?? null,
                                'gramagem' => $item['gramagem'] ?? null,
                                'eh_bebida' => $item['eh_bebida'] ?? false,
                                'classificacao' => $this->classificacaoLimpa($item['classificacao'] ?? []),
                                'imagem' => $item['imagem'] ?? null,
                                'dias_funcionamento' => $item['dias_funcionamento'] ?? [],
                            ]);
                        }

                        if ($item['tipo'] === 'BEB') {
                            $item['tipo'] = 'BEB';

                            $itemCriado = Item::create([
                                'external_id' => $item['external_id'] ?? null,
                                'categoria_id' => $categoria->id,
                                'nome' => $item['nome'],
                                'preco' => $item['preco'] ?? null,
                                'tipo' => $item['tipo'],
                                'tipo_preco' => $item['tipo_preco'],
                                'eh_bebida' => $item['eh_bebida'] ?? false,
                                'imagem' => $item['imagem'] ?? null,
                                'classificacao' => $this->classificacaoLimpa($item['classificacao'] ?? []),
                                'dias_funcionamento' => $item['dias_funcionamento'] ?? [],
                            ]);
                        }

                        if ($item['tipo'] === 'IND') {
                            $item['tipo'] = 'IND';

                            $itemCriado = Item::create([
                                'external_id' => $item['external_id'] ?? null,
                                'categoria_id' => $categoria->id,
                                'nome' => $item['nome'],
                                'preco' => $item['preco'] ?? null,
                                'tipo' => $item['tipo'],
                                'tipo_preco' => $item['tipo_preco'],
                                'eh_bebida' => $item['eh_bebida'] ?? false,
                                'imagem' => $item['imagem'] ?? null,
                                'classificacao' => $this->classificacaoLimpa($item['classificacao'] ?? []),
                                'dias_funcionamento' => $item['dias_funcionamento'] ?? [],
                            ]);
                        }

                        if ($exportaDadosIfood) {
                            ImportacaoItemIfood::query()->create([
                                'item_id' => $itemCriado->getAttribute('id'),
                                'item_ifood_id' => Str::uuid(),
                                'product_id' => Str::uuid(),
                            ]);
                        }
                    }

                    if ($categoria->tipo === 'P') {

                        $item['tipo'] = 'PIZ';
                        $item['tipo_preco'] = 'preco_item';

                        $itemCriado = Item::create([
                            'external_id' => $item['external_id'] ?? null,
                            'categoria_id' => $categoria->id,
                            'tipo' => $item['tipo'],
                            'nome' => $item['nome'],
                            'descricao' => $item['descricao'] ?? null,
                            'tipo_preco' => $item['tipo_preco'],
                            'imagem' => $item['imagem'] ?? null,
                            'classificacao' => $this->classificacaoLimpa($item['classificacao'] ?? []),
                            'dias_funcionamento' => $item['dias_funcionamento'] ?? [],
                        ]);
                        foreach (array_filter($item['precos'] ?? [], fn ($p) => $p['status']) as $preco) {
                            ItemPreco::create([
                                'tamanho_id' => $preco['tamanho_id'] ?? null,
                                'item_id' => $itemCriado->id,
                                'classificacao' => $this->classificacaoLimpa($item['classificacao'] ?? []),
                                'preco' => $preco['preco'] ?? null,
                                'dias_funcionamento' => $preco['dias_funcionamento'] ?? [],
                            ]);
                        }

                        if ($exportaDadosIfood) {
                            ImportacaoItemIfood::query()->create([
                                'item_id' => $itemCriado->getAttribute('id'),
                                'item_ifood_id' => Str::uuid(),
                                'product_id' => Str::uuid(),
                            ]);
                        }
                    }

                    if ($exportaDadosIfood) {
                        $api = app(ApiExternalIfood::class);

                        $api->upsertItem($empresa, $itemCriado);
                    }

                    // Imagem agora está vinculada a um item salvo: deixa de ser candidata
                    // à limpeza automática de imagens órfãs (itens:limpar-imagens-temporarias).
                    if (! empty($item['imagem'])) {
                        ImagemTemporaria::query()->where('url', $item['imagem'])->delete();
                    }
                });
            } catch (\Exception $e) {
                throw new Exception('Erro ao cadastrar esse item. Por favor, entrar em contato com o suporte.', $e->getCode(), $e);
            }
    }

    public function classificacaoLimpa(array $classificacoes): array
    {
        return array_values(array_map(
            fn($classificacao) => $classificacao['value'],
            array_filter($classificacoes, fn($classificacao) => $classificacao['status'])
        ));
    }
}
