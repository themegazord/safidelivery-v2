<?php

namespace App\Services\AnotaAI;

use App\Models\Cardapio;
use App\Models\Categoria;
use App\Models\CategoriaBorda;
use App\Models\CategoriaMassa;
use App\Models\CategoriaTamanho;
use App\Models\Complemento;
use App\Models\Empresa;
use App\Models\GrupoComplemento;
use App\Models\Item;
use App\Models\ItemPreco;
use App\Services\Helpers\PizzaDetector;
use App\Traits\TrataMGCObjectStore;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ApiExternalAnotaAI extends Endpoints
{
    use TrataMGCObjectStore;

    protected Empresa $empresa;
    protected string $token;
    public function __construct()
    {
        $this->empresa = Auth::user()->empresa;
        $this->token = $this->empresa->integracoes()->where('tipo', 'anotaai')->value('companyToken');
    }

    public function importarCategorias(int $empresa_id): void
    {
        $detector = app(PizzaDetector::class);
        $resposta = Http::withHeaders([
            'Accept' => 'application/json',
            'Authorization' => $this->token
        ])->get($this->getEndpointExportacaoCategorias());

        $adicionais = [];
        $categorias = [];

        foreach ($resposta->json()['data'] as $item) {
            if ($item['is_additional'] === true) {
                $adicionais[$item['id']] = $item;
            } else {
                $categorias[$item['id']] = $item;
            }
        }

        $categoriasCriadas = collect();
        DB::transaction(function () use ($categorias, $adicionais, $detector, $categoriasCriadas, $empresa_id) {
            $cardapioAtual = Cardapio::query()->create([
                'nome' => 'Cardapio AnotaAI',
                'dias_funcionamento' => ['0', 1, 2, 3, 4, 5, 6],
                'descricao' => 'Cardapio AnotaAI',
                'tipo_funcionamento' => 'delivery',
                'tipo_importacao' => 'anotaai',
                'empresa_id' => $empresa_id
            ]);
            foreach ($categorias as $categoria) {
                $ehPizza = $detector->isPizza($categoria['title']);
                $categoriaCriada = Categoria::query()->create([
                    'integracao_id' => $categoria['id'],
                    'cardapio_id' => $cardapioAtual->getAttribute('id'),
                    'tipo' => $ehPizza ? 'P' : 'I',
                    'nome' => $categoria['title'],
                ]);

                if ($ehPizza) {
                    foreach ($categoria['itens'] as $tamanho) {
                        $sabor = array_filter($tamanho['next_steps'], fn($p) => str_contains($p['category_title'], 'Sabor'))[0];

                        $categoriaTamanhoCriada = CategoriaTamanho::query()->create([
                            'external_id' => !empty($tamanho['external_id']) ? $this->retornaExternalId($tamanho['external_id']) : null,
                            'categoria_id' => $categoriaCriada->getAttribute('id'),
                            'nome' => $tamanho['title'],
                            'qtde_pedacos' => 1,
                            'qtde_sabores' => [$sabor['max'] > 4 ? 4 : $sabor['max']]
                        ]);


                        foreach ($tamanho['next_steps'] as $passo) {
                            // Massa
                            if (str_contains($passo['category_title'], 'Massa')) {
                                $grupoMassa = $adicionais[$passo['category_id']];

                                foreach ($grupoMassa['itens'] as $massa) {
                                    CategoriaMassa::query()->create([
                                        'external_id' => !empty($massa['external_id']) ? $this->retornaExternalId($massa['external_id']) : null,
                                        'categoria_id' => $categoriaCriada->getAttribute('id'),
                                        'nome' => $massa['title'],
                                        'preco' => $massa['week_prices'][0]['price']
                                    ]);
                                }
                            }

                            // Borda
                            if (str_contains($passo['category_title'], 'Borda')) {
                                $grupoBorda = $adicionais[$passo['category_id']];

                                foreach ($grupoBorda['itens'] as $borda) {
                                    CategoriaBorda::query()->create([
                                        'external_id' => !empty($borda['external_id']) ? $this->retornaExternalId($borda['external_id']) : null,
                                        'categoria_id' => $categoriaCriada->getAttribute('id'),
                                        'nome' => $borda['title'],
                                        'preco' => $borda['week_prices'][0]['price']
                                    ]);
                                }
                            }


                            // Sabor
                            if (str_contains($passo['category_title'], 'Sabor')) {
                                $grupoSabor = $adicionais[$passo['category_id']];

                                foreach ($grupoSabor['itens'] as $sabor) {
                                    $itemPizzaCriada = Item::query()->create([
                                        'external_id' => !empty($sabor['external_id']) ? $this->retornaExternalId($sabor['external_id']) : null,
                                        'categoria_id' => $categoriaCriada->getAttribute('id'),
                                        'nome' => $sabor['title'],
                                        'tipo' => 'PIZ',
                                        'tipo_preco' => 'preco_item',
                                        'descricao' => $sabor['description'],
                                        'imagem' => !empty($item['link_image']) ? $this->importarImagemUrl(config('services.mgc.bucket'), $item['link_image']) : null
                                    ]);

                                    ItemPreco::query()->create([
                                        'item_id' => $itemPizzaCriada->getAttribute('id'),
                                        'tamanho_id' => $categoriaTamanhoCriada->getAttribute('id'),
                                        'preco' => $sabor['week_prices'][0]['price']
                                    ]);
                                }
                            }
                        }
                    }
                }

                if (!$ehPizza) {
                    foreach ($categoria['itens'] as $item) {
                        $itemNormalCriada = Item::query()->create([
                            'external_id' => !empty($item['external_id']) ? $this->retornaExternalId($item['external_id']) : null,
                            'categoria_id' => $categoriaCriada->getAttribute('id'),
                            'nome' => $item['title'],
                            'descricao' => $item['description'],
                            'tipo' => 'PRE',
                            'tipo_preco' => 'fixo',
                            'preco' => $item['week_prices'][0]['price'],
                            'imagem' => !empty($item['link_image']) ? $this->importarImagemUrl(config('services.mgc.bucket'), $item['link_image']) : null
                        ]);

                        foreach ($item['next_steps'] as $passo) {
                            $grupoComplemento = $adicionais[$passo['category_id']];

                            $grupoComplementoCriada = GrupoComplemento::query()->create([
                                'item_id' => $itemNormalCriada->getAttribute('id'),
                                'nome' => $grupoComplemento['title'],
                                'obrigatoriedade' => $passo['min'] !== 0,
                                'qtd_minima' => $passo['min'],
                                'qtd_maxima' => $passo['max']
                            ]);

                            foreach ($grupoComplemento['itens'] as $complemento) {
                                Complemento::query()->create([
                                    'external_id' => !empty($complemento['external_id']) ? $this->retornaExternalId($complemento['external_id']) : null,
                                    'grupo_id' => $grupoComplementoCriada->getAttribute('id'),
                                    'nome' => $complemento['title'],
                                    'descricao' => $complemento['description'],
                                    'preco' => $complemento['week_prices'][0]['price'],
                                    'status' => true
                                ]);
                            }
                        }
                    }
                }
                $categoriasCriadas->push($categoriaCriada);
            }
        });
    }

    private function retornaExternalId(string $external_id): int
    {
        return preg_replace('/[^\d]/', '', $external_id);
    }
}
