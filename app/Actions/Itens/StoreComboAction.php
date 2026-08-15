<?php

namespace App\Actions\Itens;

use App\Models\Cardapio;
use App\Models\Categoria;
use App\Models\Combo;
use App\Models\Complemento;
use App\Models\ImagemTemporaria;
use App\Models\Item;
use Exception;
use Illuminate\Support\Facades\DB;

class StoreComboAction
{
    public function handle(array $dados, Cardapio $cardapio, Categoria $categoria): Combo
    {
        try {
            return DB::transaction(function () use ($dados, $cardapio, $categoria) {
                $combo = Combo::create([
                    'categoria_id' => $dados['categoria_id'] ?? $categoria->getAttribute('id'),
                    'nome' => $dados['nome'],
                    'external_id' => $dados['external_id'] ?? null,
                    'descricao' => $dados['descricao'] ?? null,
                    'tipo_preco' => $dados['tipo_preco'],
                    'imagem' => $dados['imagem'] ?? null,
                    'classificacao' => $this->classificacaoLimpa($dados['classificacao'] ?? []),
                    'dias_funcionamento' => $dados['dias_funcionamento'] ?? [],
                ]);

                $combo->meta()->create([
                    'tipo_precificacao' => $dados['tipo_preco'],
                    'preco_combo' => $dados['meta']['preco_combo'] ?? null,
                    'desconto_combo' => $dados['meta']['desconto_combo'] ?? null,
                ]);

                $this->criaGrupos($combo, $cardapio, $dados['grupos'] ?? []);
                $this->criaEntradasComplemento($combo, $cardapio, $dados['grupos_complemento'] ?? []);

                if (! empty($dados['imagem'])) {
                    ImagemTemporaria::query()->where('url', $dados['imagem'])->delete();
                }

                return $combo;
            });
        } catch (Exception $e) {
            throw new Exception('Erro ao cadastrar esse combo. Por favor, entrar em contato com o suporte.', $e->getCode(), $e);
        }
    }

    public function criaGrupos(Combo $combo, Cardapio $cardapio, array $grupos): void
    {
        foreach ($grupos as $ordem => $grupo) {
            $grupoCriado = $combo->grupos()->create([
                'nome' => $grupo['nome'],
                'qtd_maxima' => $grupo['configuracao']['qtd_maxima'] ?? 1,
                'ordem' => $grupo['ordem'] ?? $ordem,
                'configuracao' => [
                    'obrigatorio' => $grupo['configuracao']['obrigatorio'] ?? true,
                    'qtd_minima' => $grupo['configuracao']['qtd_minima'] ?? 1,
                    'qtd_maxima' => $grupo['configuracao']['qtd_maxima'] ?? 1,
                ],
            ]);

            foreach ($grupo['entradas'] ?? [] as $entrada) {
                // Filtra pelo cardápio do combo pra impedir que um item de outra
                // empresa seja referenciado (o id só passa pela validação `exists`).
                $itemReferenciado = Item::query()
                    ->whereHas('categoria', fn ($query) => $query->where('cardapio_id', $cardapio->getAttribute('id')))
                    ->where('id', $entrada['referencia_id'])
                    ->firstOrFail();

                $combo->entradas()->create([
                    'tipo' => 'item',
                    'combo_grupo_id' => $grupoCriado->getAttribute('id'),
                    'grupo_complemento_id' => null,
                    'referencia_id' => $itemReferenciado->getAttribute('id'),
                    'nome_snapshot' => $itemReferenciado->getAttribute('nome'),
                    'preco_snapshot' => $itemReferenciado->getAttribute('preco') ?? 0,
                ]);
            }
        }
    }

    public function criaEntradasComplemento(Combo $combo, Cardapio $cardapio, array $gruposComplemento): void
    {
        foreach ($gruposComplemento as $grupoComplemento) {
            foreach ($grupoComplemento['complementos'] ?? [] as $complemento) {
                $complementoReferenciado = Complemento::query()
                    ->whereHas('grupos.item.categoria', fn ($query) => $query->where('cardapio_id', $cardapio->getAttribute('id')))
                    ->where('id', $complemento['referencia_id'])
                    ->firstOrFail();

                $combo->entradas()->create([
                    'tipo' => 'complemento',
                    'combo_grupo_id' => null,
                    'grupo_complemento_id' => $grupoComplemento['grupo_complemento_id'],
                    'referencia_id' => $complementoReferenciado->getAttribute('id'),
                    'nome_snapshot' => $complementoReferenciado->getAttribute('nome'),
                    'preco_snapshot' => $complementoReferenciado->getAttribute('preco') ?? 0,
                ]);
            }
        }
    }

    public function classificacaoLimpa(array $classificacoes): array
    {
        return array_values(array_map(
            fn ($classificacao) => $classificacao['value'],
            array_filter($classificacoes, fn ($classificacao) => $classificacao['status'])
        ));
    }
}
