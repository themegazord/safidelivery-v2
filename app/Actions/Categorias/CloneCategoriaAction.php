<?php

namespace App\Actions\Categorias;

use App\Models\Categoria;
use App\Models\CategoriaBorda;
use App\Models\CategoriaMassa;
use App\Models\CategoriaTamanho;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;

class CloneCategoriaAction {
    public function handle(string $cardapio_id, string $categoria_id) {
        try {
            $categoriaAtual = Categoria::query()
                ->where('cardapio_id', $cardapio_id)
                ->where('id', $categoria_id)
                ->firstOrFail();

            $categoriaDuplicada = $categoriaAtual->replicate();

            $categoriaDuplicada->save();

            if ($categoriaAtual->tipo === 'P') {
                /**
                 * @var CategoriaTamanho $tamanho
                 * @var CategoriaMassa $massa
                 * @var CategoriaBorda $borda
                 */
                foreach (CategoriaTamanho::where('categoria_id', $categoriaAtual->id)->get() as $tamanho) {
                    $tamanhoDuplicado = $tamanho->replicate()->fill([
                        'categoria_id' => $categoriaDuplicada->id,
                    ]);
                    $tamanhoDuplicado->save();
                }
                foreach (CategoriaBorda::where('categoria_id', $categoriaAtual->id)->get() as $borda) {
                    $bordaDuplicado = $borda->replicate()->fill([
                        'categoria_id' => $categoriaDuplicada->id,
                    ]);
                    $bordaDuplicado->save();
                }
                foreach (CategoriaMassa::where('categoria_id', $categoriaAtual->id)->get() as $massa) {
                    $massaDuplicado = $massa->replicate()->fill([
                        'categoria_id' => $categoriaDuplicada->id,
                    ]);
                    $massaDuplicado->save();
                }
            }
        } catch (ModelNotFoundException $mnfe) {
            throw new Exception('Categoria não foi localizada.', $mnfe->getCode(), $mnfe);
        } catch (Exception $e) {
            throw new Exception('Ocorreu um erro ao tentar clonar essa categoria. Por favor, entre em contato com o suporte.', Response::HTTP_INTERNAL_SERVER_ERROR, $e);
        }
    }
}
