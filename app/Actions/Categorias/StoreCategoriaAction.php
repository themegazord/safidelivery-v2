<?php

namespace App\Actions\Categorias {

  use App\Models\Cardapio;
    use App\Models\Categoria;
    use App\Models\CategoriaBorda;
    use App\Models\CategoriaMassa;
    use App\Models\CategoriaTamanho;
    use App\Models\Empresa;
    use App\Services\IFOOD\ApiExternalIfood;
    use App\Traits\Categorias\ValidaExternalIdUnico;
    use Exception;
    use Illuminate\Http\Response;
    use Illuminate\Support\Str;

  class StoreCategoriaAction
  {
    use ValidaExternalIdUnico;

    public function handle(array $dados, Cardapio $cardapio, bool $exportaDadosIfood, Empresa $empresa)
    {
      if ($dados['tipo'] === 'P') {
        $conflito = $this->validarExternalIdUnico($dados['tamanhos'], 'tamanho', $cardapio->id)
          ?? $this->validarExternalIdUnico($dados['massas'], 'massa', $cardapio->id)
          ?? $this->validarExternalIdUnico($dados['bordas'], 'borda', $cardapio->id);

        if ($conflito) {
          throw new Exception($conflito, Response::HTTP_UNPROCESSABLE_ENTITY);
        }
      }

      try {
        /** @var \App\Models\Categoria $categoria */
        $categoria = \Illuminate\Support\Facades\DB::transaction(function () use ($cardapio, $dados) {
          $categoria = Categoria::query()->create([
            'cardapio_id' => $cardapio->id,
            'tipo' => $dados['tipo'],
            'nome' => $dados['nome'],
            'dias_funcionamento' => $dados['dias_funcionamento'] ?? [],
          ]);

          if ($dados['tipo'] === 'P') {
            foreach ($dados['tamanhos'] as $tamanho) {
              CategoriaTamanho::query()->create([
                'categoria_id' => $categoria->id,
                ...$tamanho,
              ]);
            }
            foreach ($dados['massas'] as $massa) {
              CategoriaMassa::query()->create([
                'categoria_id' => $categoria->id,
                ...$massa,
              ]);
            }
            foreach ($dados['bordas'] as $borda) {
              CategoriaBorda::query()->create([
                'categoria_id' => $categoria->id,
                ...$borda,
              ]);
            }
          }

          return $categoria;
        });

        if ($cardapio->getAttribute('tipo_importacao') === 'ifood') {
          $importacaoId = Str::uuid();
          $categoria->update([
            'importacao_id' => $importacaoId,
          ]);
          $categoria->categoriaIfood()->create([
            'category_id' => $importacaoId,
          ]);
        }

        if ($exportaDadosIfood) {
          $api = app(ApiExternalIfood::class);

          try {
            $api->cadastrarCategoria(
              $categoria,
              $empresa,
              $empresa->integracoes->where('tipo', 'ifood')->value('merchantId')
            );
          } catch (Exception $e) {
            throw new Exception('Erro ao cadastrar essa categoria dentro do IFOOD. Por favor, entre em contato com o suporte.', $e->getCode(), $e);
          }
        }
      } catch (\Exception $e) {
        throw new Exception('Houve um problema no cadastro da categoria no banco de dados, por favor, entrar em contato com o suporte.', $e->getCode(), $e);
      }
    }
  }
}
