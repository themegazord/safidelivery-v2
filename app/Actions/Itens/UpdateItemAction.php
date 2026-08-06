<?php

namespace App\Actions\Itens;

use App\Models\Categoria;
use App\Models\Empresa;
use App\Models\ImagemTemporaria;
use App\Models\ItemPreco;
use App\Services\IFOOD\ApiExternalIfood;
use App\Traits\Categorias\ValidaExternalIdUnico;
use Exception;
use Symfony\Component\HttpFoundation\Response;

class UpdateItemAction {
    use ValidaExternalIdUnico;

    public function handle(array $itemEdicao, int $cardapio_id, Categoria $categoria, bool $exportaDadosIfood, Empresa $empresa, int $item_id) {
        $actionShowItem = app(ShowItemAction::class);
        $actionStoreItem = app(StoreItemAction::class);
        $classificacoesLimpasItemEditado = $actionStoreItem->classificacaoLimpa($itemEdicao['classificacao'] ?? []);
        $itemAtual = $actionShowItem->handle($categoria->getAttribute('id'), $item_id);

        if (! empty($itemEdicao['external_id'])) {
            $conflito = $this->validarExternalIdItemParaEdicao(
                $itemEdicao['external_id'],
                $itemEdicao['nome'],
                $itemAtual->getAttribute('id'),
                $cardapio_id
            );

            if ($conflito) {
                throw new Exception($conflito, Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use (
                $itemEdicao,
                $itemAtual,
                $classificacoesLimpasItemEditado,
                $exportaDadosIfood,
                $empresa) {

                $itemAtual->update([
                    'imagem' => $itemEdicao['imagem'] ?? null,
                    'external_id' => $itemEdicao['external_id'] ?? null,
                    'categoria_id' => $itemEdicao['categoria_id'] ?? null,
                    'nome' => $itemEdicao['nome'],
                    'preco' => $itemEdicao['preco'] ?? null,
                    'desconto' => $itemEdicao['desconto'] ?? false,
                    'valor_desconto' => $itemEdicao['valor_desconto'] ?? null,
                    'porcentagem_desconto' => $itemEdicao['porcentagem_desconto'] ?? null,
                    'descricao' => $itemEdicao['descricao'] ?? null,
                    'qtde_pessoas' => $itemEdicao['qtde_pessoas'] ?? null,
                    'peso' => $itemEdicao['peso'] ?? null,
                    'gramagem' => $itemEdicao['gramagem'] ?? null,
                    'eh_bebida' => $itemEdicao['eh_bebida'] ?? false,
                    'classificacao' => $classificacoesLimpasItemEditado,
                    'dias_funcionamento' => $itemEdicao['dias_funcionamento'] ?? [],
                ]);
                $itemEditado = $itemAtual;

                if ($itemAtual->tipo === 'PIZ') {
                    foreach ($itemEdicao['precos'] ?? [] as $preco) {
                        $itemPreco = ItemPreco::find($preco['id'] ?? null);
                        if (! $itemPreco) {
                            continue;
                        }
                        $itemPreco->update([
                            'status' => $preco['status'] ?? false,
                            'preco' => $preco['preco'] ?? null,
                            'dias_funcionamento' => $preco['dias_funcionamento'] ?? [],
                        ]);
                    }
                }

                if ($exportaDadosIfood) {
                    $api = app(ApiExternalIfood::class);

                    $api->upsertItem($empresa, $itemEditado);
                }

                // Imagem agora está vinculada a um item salvo: deixa de ser candidata
                // à limpeza automática de imagens órfãs (itens:limpar-imagens-temporarias).
                if (! empty($itemEdicao['imagem'])) {
                    ImagemTemporaria::query()->where('url', $itemEdicao['imagem'])->delete();
                }
            });
        } catch (\Exception $e) {
            throw new Exception('Tivemos problemas ao editar esse item, por favor, entre em contato com o suporte.', $e->getCode(), $e);
        }
    }
}
