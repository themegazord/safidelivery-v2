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
        $conflito = $this->validarExternalIdUnico($dados['tamanho'], 'tamanho', $cardapio->id)
          ?? $this->validarExternalIdUnico($dados['massa'], 'massa', $cardapio->id)
          ?? $this->validarExternalIdUnico($dados['borda'], 'borda', $cardapio->id);

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
            foreach ($dados['tamanho'] as $tamanho) {
              CategoriaTamanho::query()->create([
                'categoria_id' => $categoria->id,
                ...$tamanho,
              ]);
            }
            foreach ($dados['massa'] as $massa) {
              CategoriaMassa::query()->create([
                'categoria_id' => $categoria->id,
                ...$massa,
              ]);
            }
            foreach ($dados['borda'] as $borda) {
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
