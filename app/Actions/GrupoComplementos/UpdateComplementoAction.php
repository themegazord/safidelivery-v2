<?php

namespace App\Actions\GrupoComplementos;

use App\Models\Complemento;
use App\Models\Empresa;
use App\Models\GrupoComplemento;
use App\Models\Item;
use App\Services\IFOOD\ApiExternalIfood;
use App\Traits\Categorias\ValidaExternalIdUnico;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;

class UpdateComplementoAction {
    use ValidaExternalIdUnico;

    public function handle(array $dados, Item $item, string $grupo_id, string $complemento_id, int $cardapioId, bool $exportaDadosIfood, Empresa $empresa): void {
        try {
            $grupo = GrupoComplemento::query()
                ->where('item_id', $item->getAttribute('id'))
                ->where('id', $grupo_id)
                ->firstOrFail();

            $complemento = Complemento::query()
                ->where('grupo_id', $grupo->getAttribute('id'))
                ->where('id', $complemento_id)
                ->firstOrFail();
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Complemento não foi encontrado.', $mnfe->getCode(), $mnfe);
        }

        if (! empty($dados['external_id'])) {
            $conflito = $this->validarExternalIdComplementosParaEdicao([$dados], (int) $grupo->getAttribute('id'), $cardapioId);

            if ($conflito) {
                throw new Exception($conflito, Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $precoAtual = number_format((float) $complemento->getAttribute('preco'), 2, '.', '');
        $precoNovo = number_format((float) $dados['preco'], 2, '.', '');
        $precoAlterado = $precoAtual !== $precoNovo;
        $statusAlterado = (bool) $complemento->getAttribute('status') !== (bool) $dados['status'];

        try {
            $complemento->update([
                'external_id' => $dados['external_id'] ?? null,
                'imagem' => $dados['imagem'] ?? null,
                'nome' => $dados['nome'],
                'descricao' => $dados['descricao'] ?? null,
                'preco' => $precoNovo,
                'status' => $dados['status'],
            ]);

            if ($exportaDadosIfood && $complemento->relationLoaded('complementoIfood') === false) {
                $complemento->load('complementoIfood');
            }

            if ($exportaDadosIfood && $complemento->complementoIfood) {
                $api = app(ApiExternalIfood::class);

                if ($precoAlterado) {
                    $api->updatePriceComplemento($empresa, $complemento->getAttribute('id'));
                }

                if ($statusAlterado) {
                    $api->updateStatusComplemento($empresa, $complemento->getAttribute('id'));
                }
            }
        } catch (\Exception $e) {
            throw new Exception('Não foi possível editar o complemento, por favor, entre em contato com o suporte', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
