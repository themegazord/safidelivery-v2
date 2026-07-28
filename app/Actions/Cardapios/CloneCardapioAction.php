<?php

namespace App\Actions\Cardapios;

use App\Models\Cardapio;
use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class CloneCardapioAction {
  public function handle(int $empresa_id, int $cardapio_id, string $novoNomeCardapio): void {
    $cardapio = Cardapio::query()->where('empresa_id', $empresa_id)->where('id', $cardapio_id)->firstOrFail();

    try {
      if ($cardapio->categorias()->doesntExist()) {
        throw new Exception('Cardápio vazio não pode ser clonado', Response::HTTP_UNPROCESSABLE_ENTITY);
      }

      DB::transaction(function () use ($cardapio, $novoNomeCardapio) {
        $cardapioOriginal = $cardapio;
        $cardapioClonado = $cardapioOriginal->replicate();
        if (!empty($novoNomeCardapio)) $cardapioClonado->nome = $novoNomeCardapio;
        $cardapioClonado->save();

        foreach ($cardapioOriginal->categorias as $categoriaOriginal) {
          $categoriaClonada = $categoriaOriginal->replicate();
          $categoriaClonada->cardapio_id = $cardapioClonado->id;
          $categoriaClonada->save();

          if ($categoriaOriginal->tipo === 'P') {
            $tamanhoMap = [];
            foreach ($categoriaOriginal->tamanhos as $categoriaTamanhoOriginal) {
              $categoriaTamanhoClonado = $categoriaTamanhoOriginal->replicate();
              $categoriaTamanhoClonado->categoria_id = $categoriaClonada->id;
              $categoriaTamanhoClonado->save();
              $tamanhoMap[$categoriaTamanhoOriginal->id] = $categoriaTamanhoClonado->id;
            }

            foreach ($categoriaOriginal->bordas as $categoriaBordaOriginal) {
              $categoriaBordaClonada = $categoriaBordaOriginal->replicate();
              $categoriaBordaClonada->categoria_id = $categoriaClonada->id;
              $categoriaBordaClonada->save();
            }

            foreach ($categoriaOriginal->massas as $categoriaMassaOriginal) {
              $categoriaMassaClonada = $categoriaMassaOriginal->replicate();
              $categoriaMassaClonada->categoria_id = $categoriaClonada->id;
              $categoriaMassaClonada->save();
            }

            foreach ($categoriaOriginal->itens as $itemPizzaOriginal) {
              $itemPizzaClonada = $itemPizzaOriginal->replicate();
              $itemPizzaClonada->categoria_id = $categoriaClonada->id;
              $itemPizzaClonada->save();

              foreach ($itemPizzaOriginal->precosItemPizza as $precoItemPizzaOriginal) {
                $precoItemPizzaClonada = $precoItemPizzaOriginal->replicate();
                $precoItemPizzaClonada->item_id = $itemPizzaClonada->id;
                $precoItemPizzaClonada->tamanho_id = $tamanhoMap[$precoItemPizzaOriginal->tamanho_id];
                $precoItemPizzaClonada->save();
              }
            }
          }

          if ($categoriaOriginal->tipo === 'I') {
            foreach ($categoriaOriginal->itens as $itemNormalOriginal) {
              $itemNormalClonado = $itemNormalOriginal->replicate();
              $itemNormalClonado->categoria_id = $categoriaClonada->id;
              $itemNormalClonado->save();

              if ($itemNormalOriginal->grupo_complemento()->doesntExist()) {
                continue;
              }

              foreach ($itemNormalOriginal->grupo_complemento as $grupoComplementoOriginal) {
                $grupoComplementoClonado = $grupoComplementoOriginal->replicate();
                $grupoComplementoClonado->item_id = $itemNormalClonado->id;
                $grupoComplementoClonado->save();

                if ($grupoComplementoOriginal->complementos()->doesntExist()) {
                  continue;
                }

                foreach ($grupoComplementoOriginal->complementos as $complementoOriginal) {
                  $complementoClonado = $complementoOriginal->replicate();
                  $complementoClonado->grupo_id = $grupoComplementoClonado->id;
                  $complementoClonado->save();
                }
              }
            }
          }
        }
      });
    } catch (Exception $e) {
      throw new Exception('Erro ao tentar clonar um cardápio, por favor, entrar em contato com o suporte', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
    }
  }
}