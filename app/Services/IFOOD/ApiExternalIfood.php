<?php

namespace App\Services\IFOOD;

use App\Enums\ModoRetiradaEnum;
use App\Enums\TipoLugarRetiradaEnum;
use App\Models\Cardapio;
use App\Models\Categoria;
use App\Models\CategoriaBorda;
use App\Models\CategoriaMassa;
use App\Models\CategoriaTamanho;
use App\Models\Combo;
use App\Models\ComboEntrada;
use App\Models\ComboGrupo;
use App\Models\ComboMeta;
use App\Models\Complemento;
use App\Models\Configuracao;
use App\Models\Empresa;
use App\Models\Endereco;
use App\Models\FinanceiroPedido;
use App\Models\GrupoComplemento;
use App\Models\ImportacaoCardapioIfood;
use App\Models\ImportacaoComplementoIfood;
use App\Models\ImportacaoGrupoComplementoIfood;
use App\Models\ImportacaoItemIfood;
use App\Models\Integracao;
use App\Models\Item;
use App\Models\ItemPreco;
use App\Models\Pedido;
use App\Models\PedidoComboItem;
use App\Models\PedidoComboItemCustomizacao;
use App\Models\PedidoComplemento;
use App\Models\PedidoIntegracaoIfood;
use App\Models\PedidoItem;
use App\Traits\TrataMGCObjectStore;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

final class ApiExternalIfood
{
    use CatalogEndpoints, EventEndpoints, OrderEndpoints, TrataMGCObjectStore;

    public function autenticacao(int $empresa_id): void
    {
        $integracao = $this->obterIntegracaoIfood($empresa_id);
        if (! $integracao) {
            Log::warning('IFOOD autenticacao: integracao nao encontrada', ['empresa_id' => $empresa_id]);

            return;
        }

        if ($this->tokenAindaValido($empresa_id)) {
            Log::info('IFOOD autenticacao: token ainda valido', [
                'empresa_id' => $empresa_id,
                'lifetime' => Empresa::query()->findOrFail($empresa_id)->lifetimeTokenIfood,
            ]);

            return;
        }

        try {
            $resposta = Http::asForm()->withHeaders([
                'accept' => 'application/json',
            ])->post($this->urlBaseAutenticacao.$this->oauthToken, [
                'grantType' => 'client_credentials',
                'clientId' => $integracao->clientId,
                'clientSecret' => $integracao->clientSecret,
                'authorizationCode' => '',
                'authorizationCodeVerifier' => '',
                'refreshToken' => '',
            ]);

            Log::info('IFOOD autenticacao resposta', [
                'empresa_id' => $empresa_id,
                'status' => $resposta->status(),
                'body' => $resposta->json(),
            ]);

            $dados = $resposta->json();

            if (! isset($dados['accessToken'], $dados['expiresIn'])) {
                throw new Exception('Resposta inválida do IFOOD');
            }

            Empresa::findOrFail($empresa_id)->update([
                'tokenIfood' => $dados['accessToken'],
                'lifetimeTokenIfood' => now()->addSeconds($dados['expiresIn']),
            ]);
        } catch (Exception $e) {
            Log::warning('Integração IFOOD: Falha na tentativa de autenticação com IFOOD.', [
                'empresa_id' => $empresa_id,
                'erro' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Autentica no iFood com credenciais fornecidas diretamente (sem buscar do banco).
     * Retorna os dados do token em caso de sucesso.
     *
     * @throws Exception Se a autenticação falhar ou a resposta for inválida.
     */
    public function autenticacaoComCredenciais(string $clientId, string $clientSecret): array
    {
        $resposta = Http::asForm()->withHeaders([
            'accept' => 'application/json',
        ])->post($this->urlBaseAutenticacao.$this->oauthToken, [
            'grantType' => 'client_credentials',
            'clientId' => $clientId,
            'clientSecret' => $clientSecret,
            'authorizationCode' => '',
            'authorizationCodeVerifier' => '',
            'refreshToken' => '',
        ]);

        Log::info('IFOOD autenticacaoComCredenciais resposta', [
            'status' => $resposta->status(),
            'body' => $resposta->json(),
        ]);

        $dados = $resposta->json();

        if (! $resposta->successful() || ! isset($dados['accessToken'], $dados['expiresIn'])) {
            throw new Exception('Falha na autenticação com o iFood. Verifique as credenciais e tente novamente.');
        }

        return $dados;
    }

    /**
     * @throws ConnectionException
     */
    public function consultaListagemPedidos(int $empresa_id): void
    {
        $this->autenticacao($empresa_id);

        $integracao = $this->obterIntegracaoIfood($empresa_id);

        $headers = ['accept' => 'application/json'];
        if ($integracao?->merchantId) {
            $headers['x-polling-merchants'] = $integracao->merchantId;
        }

        $resposta = Http::withToken(Empresa::query()->findOrFail($empresa_id)->tokenIfood)
            ->withHeaders($headers)
            ->get($this->urlBaseEventos.$this->pollingEvents);

        if ($resposta->ok()) {
            $pedidos = $resposta->json();
            foreach ($pedidos as $pedido) {
                try {
                    PedidoIntegracaoIfood::query()->updateOrCreate(['uuid' => $pedido['id']], [
                        'uuid' => $pedido['id'],
                        'empresa_id' => $empresa_id,
                        'orderId' => $pedido['orderId'],
                        'fullCode' => $pedido['fullCode'],
                        'code' => $pedido['code'],
                        'metadata' => $pedido['metadata'] ?? [],
                        'created_ifood_at' => $pedido['createdAt'],
                    ]);

                    if ($pedido['fullCode'] === 'CONCLUDED') {
                        Pedido::query()
                            ->where('empresa_id', $empresa_id)
                            ->where('pedido_ifood_id', $pedido['orderId'])
                            ->update(['status' => 'entregue']);
                    }
                    if ($pedido['fullCode'] === 'CANCELLED') {
                        $pedidoCancelado = Pedido::query()
                            ->where('empresa_id', $empresa_id)
                            ->where('pedido_ifood_id', $pedido['orderId'])
                            ->first();
                        if ($pedidoCancelado) {
                            $pedidoCancelado->update(['status' => 'cancelado']);
                            $pedidoCancelado->delete();
                        }
                    }
                    if ($pedido['fullCode'] === 'DISPATCHED') {
                        Pedido::query()
                            ->where('empresa_id', $empresa_id)
                            ->where('pedido_ifood_id', $pedido['orderId'])
                            ->update(['status' => 'sendo entregue']);
                    }
                    if ($pedido['fullCode'] === 'CONFIRMED') {
                        Pedido::query()
                            ->where('empresa_id', $empresa_id)
                            ->where('pedido_ifood_id', $pedido['orderId'])
                            ->update(['status' => 'sendo preparado']);
                    }
                } catch (\Throwable $e) {
                    Log::error('Erro ao salvar pedido iFood', [
                        'pedido_id' => $pedido['id'] ?? null,
                        'erro' => $e->getMessage(),
                    ]);
                }
            }

            $this->enviaRespostaDeRecebimento($empresa_id);
        }
        $this->consultaDadosPedidoIFOOD($empresa_id);
    }

    public function importarCatalogo(
        int $empresa_id,
        string $merchantId,
        Cardapio $cardapio,
        bool $importar_item,
        bool $importar_complementos,
        bool $importar_imagens,
        bool $importar_preco,
        array $dias_funcionamento = []
    ) {
        $this->autenticacao($empresa_id);

        $catalogos = $this->consultaCatalogos($empresa_id, $merchantId);

        $token = Empresa::query()->findOrFail($empresa_id)->tokenIfood;
        $combosParaProcessar = [];

        foreach ($catalogos as $index => $catalogo) {
            $cardapioNovo = ($index === 0) ? $cardapio : tap($cardapio->replicate())->save();

            $resposta = Http::withToken($token)
                ->withHeader('Accept', 'application/json')
                ->get($this->getListAllCategoriesFromCatalog($merchantId, $catalogo['catalogId'], $importar_item));

            if (! $resposta->ok()) {
                continue;
            }

            ImportacaoCardapioIfood::query()->create([
                'cardapio_id' => $cardapio->getAttribute('id'),
                'catalogId' => $catalogo['catalogId'],
                'context' => json_encode($catalogo['context']),
            ]);

            foreach ($resposta->json() as $categoria) {
                $categoriaCriada = Categoria::query()->create([
                    'ordem' => $categoria['sequence'],
                    'cardapio_id' => $cardapioNovo->getAttribute('id'),
                    'tipo' => $categoria['template'] === 'DEFAULT' ? 'I' : 'P',
                    'nome' => $categoria['name'],
                    'dias_funcionamento' => $dias_funcionamento,
                ]);

                $categoriaCriada->categoriaIfood()->create([
                    'categoria_id' => $categoriaCriada->getAttribute('id'),
                    'category_id' => $categoria['id'],
                ]);

                if ($categoria['status'] !== 'AVAILABLE') {
                    $categoriaCriada->delete();

                    continue;
                }

                if (! $importar_item) {
                    continue;
                }

                if ($categoriaCriada->getAttribute('tipo') === 'P') {
                    foreach ($categoria['items'] as $item) {
                        $respostaItem = Http::withToken($token)
                            ->withHeader('Accept', 'application/json')
                            ->get($this->getProductById($merchantId, $item['productId']));

                        if (! $respostaItem->ok()) {
                            continue;
                        }

                        $this->criarItemPizza($categoriaCriada, $item, $respostaItem->json(), $merchantId, $token, $dias_funcionamento);
                    }

                    continue;
                }

                // Categorias DEFAULT: busca dados planos uma vez por categoria
                $dadosPlanos = $this->buscarDadosPlanos($merchantId, $categoria['id'], $token);

                foreach ($categoria['items'] as $item) {
                    $itemPlano = $dadosPlanos['items'][$item['id']] ?? null;
                    $tipo = $itemPlano['type'] ?? 'DEFAULT';

                    if ($tipo === 'COMBO_V2') {
                        $combosParaProcessar[] = [
                            'categoria' => $categoriaCriada,
                            'item' => $item,
                            'merchantId' => $merchantId,
                            'token' => $token,
                        ];

                        continue;
                    }

                    if (isset($item['ean'])) {
                        $this->criarItemIndustrializado($categoriaCriada, $item, $importar_preco, $importar_imagens, $dias_funcionamento);

                        continue;
                    }

                    $produto = $dadosPlanos['produtos'][$item['productId']] ?? null;
                    if ($produto === null) {
                        continue;
                    }

                    $dataItem = $this->montarDataItemDePlano($produto, $dadosPlanos);
                    $this->criarItemPadrao($categoriaCriada, $item, $dataItem, $importar_preco, $importar_complementos, $importar_imagens, $dias_funcionamento);
                }
            }
        }

        // Fase 2: processa combos após todos os itens DEFAULT terem sido criados
        foreach ($combosParaProcessar as $combo) {
            $this->criarCombo(
                $combo['categoria'],
                $combo['item'],
                $combo['merchantId'],
                $combo['token'],
                $importar_preco,
                $importar_imagens,
                $dias_funcionamento
            );
        }
    }

    public function cadastrarCategoria(
        Categoria $categoria,
        Empresa $empresa,
        string $merchantId,
    ) {
        $this->autenticacao($empresa->getAttribute('id'));

        $this->garantirCategoriaIfood($categoria);

        $respostaCadastroCategoria = Http::withToken($empresa->getAttribute('tokenIfood'))
            ->withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])
            ->post($this->createCategory($merchantId, $categoria->cardapio->importacaoIfood->catalogID), [
                'id' => $categoria->categoriaIfood->category_id,
                'name' => $categoria->getAttribute('nome'),
                'status' => 'AVAILABLE',
                'index' => 0,
                'template' => $categoria->getAttribute('tipo') === 'I' ? 'DEFAULT' : 'PIZZA',
            ]);

        if (! $respostaCadastroCategoria->created()) {
            throw new Exception('Houve um problema ao cadastrar a categoria dentro do IFOOD, entre em contato com o suporte.', HttpResponse::HTTP_BAD_REQUEST);
        }

        if ($respostaCadastroCategoria->badRequest()) {
            Log::error('Houve um problema ao cadastrar a categoria dentro do IFOOD => '.$respostaCadastroCategoria->json());
        }

        if ($respostaCadastroCategoria->conflict()) {
            Log::error('UUID já está sendo usado por outra categoria dentro do IFOOD'.$respostaCadastroCategoria->json());
        }
    }

    public function upsertItem(
        Empresa $empresa,
        Item $item,
    ) {
        $this->autenticacao($empresa->getAttribute('id'));

        if (! $item->itemIfood) {
            throw new \Exception("Item #{$item->id} não possui registro no iFood (itemIfood nulo)");
        }

        $categoria = $item->categoria;
        $this->garantirCategoriaIfood($categoria);

        $itemDTO = [
            'item' => [],
            'products' => [],
            'optionGroups' => [],
            'options' => [],
        ];

        $itemDTO['item'] = [
            'id' => $item->itemIfood->getAttribute('item_ifood_id'),
            'type' => $categoria->getAttribute('tipo') === 'I' ? 'DEFAULT' : 'PIZZA',
            'categoryId' => $categoria->categoriaIfood->category_id,
            'status' => $item->trashed() ? 'UNAVAILABLE' : 'AVAILABLE',
            'externalCode' => strval($item->getAttribute('external_id')),
            'productId' => $item->itemIfood->getAttribute('product_id'),
            'price' => $item->getAttribute('desconto') ? [
                'value' => (float) $item->getAttribute('valor_desconto'),
                'originalValue' => (float) $item->getAttribute('preco'),
            ] : [
                'value' => (float) $item->getAttribute('preco'),
            ],
        ];

        $product = [
            'id' => $item->itemIfood->getAttribute('product_id'),
            'name' => $item->getAttribute('nome'),
            'externalCode' => strval($item->getAttribute('external_id')),
            'serving' => match ($item->getAttribute('qtde_pessoas')) {
                1 => 'SERVES_1',
                2 => 'SERVES_2',
                3 => 'SERVES_3',
                4 => 'SERVES_4',
                default => 'NOT_APPLICABLE'
            },
        ];

        // Só inclui description se tiver valor
        if (! empty($item->getAttribute('descricao'))) {
            $product['description'] = $item->getAttribute('descricao');
        }

        // Só inclui imagePath se tiver imagem
        if ($item->getAttribute('imagem')) {
            $product['imagePath'] = 'https://static-images.ifood.com.br/pratos/'.$this->uploadIfoodImagem($empresa, $item->getAttribute('imagem'));
        }

        // Só inclui dietaryRestrictions se tiver valores
        $dietaryRestrictions = $this->mapearClassificacoesParaIfood($item->getAttribute('classificacao') ?? []);
        if (! empty($dietaryRestrictions)) {
            $product['dietaryRestrictions'] = $dietaryRestrictions;
        }

        $itemDTO['products'][0] = $product;

        if ($item->grupo_complemento->isNotEmpty()) {
            $contextos = json_decode($item->categoria->cardapio->importacaoIfood->value('context'));

            foreach ($item->grupo_complemento as $grupoComplemento) {
                if (! $grupoComplemento->grupoComplementoIfood) {
                    throw new \Exception("GrupoComplemento #{$grupoComplemento->id} não possui registro no iFood");
                }

                $optionGroupId = $grupoComplemento->grupoComplementoIfood->getAttribute('option_group_id');
                $optionsIds = [];

                foreach ($grupoComplemento->complementos as $complemento) {
                    if (! $complemento->complementoIfood) {
                        throw new \Exception("Complemento #{$complemento->id} não possui registro no iFood");
                    }

                    $contextModifiers = [];
                    foreach ($contextos as $contexto) {
                        $contextModifiers[] = [
                            'status' => $complemento->status ? 'AVAILABLE' : 'UNAVAILABLE',
                            'price' => [
                                'value' => (float) $complemento->getAttribute('preco'),
                            ],
                            'externalCode' => (string) $complemento->getAttribute('external_id'),
                            'catalogContext' => $contexto,
                            // parentOptionId removido — não documentado
                        ];
                    }

                    $itemDTO['options'][] = [
                        'id' => $complemento->complementoIfood->getAttribute('option_id'),
                        'status' => $complemento->status ? 'AVAILABLE' : 'UNAVAILABLE',
                        'productId' => $complemento->complementoIfood->getAttribute('product_id'),
                        'price' => [
                            'value' => (float) $complemento->getAttribute('preco'),
                        ],
                        'externalCode' => (string) $complemento->getAttribute('external_id'),
                        'contextModifiers' => $contextModifiers,
                    ];

                    $optionsIds[] = $complemento->complementoIfood->getAttribute('option_id');

                    // Product do complemento — só campos necessários e sem arrays vazios
                    $complementoProduct = [
                        'id' => $complemento->complementoIfood->getAttribute('product_id'),
                        'name' => $complemento->getAttribute('nome'),
                        'externalCode' => strval($complemento->getAttribute('external_id')),
                        'serving' => 'NOT_APPLICABLE',
                    ];

                    if (! empty($complemento->getAttribute('descricao'))) {
                        $complementoProduct['description'] = $complemento->getAttribute('descricao');
                    }

                    $itemDTO['products'][] = $complementoProduct;
                }

                $optionGroup = [
                    'id' => $optionGroupId,
                    'name' => $grupoComplemento->getAttribute('nome'),
                    'status' => 'AVAILABLE',
                    'optionGroupType' => 'DEFAULT',
                    'optionIds' => $optionsIds,
                ];

                // externalCode só se tiver valor
                $externalCode = $grupoComplemento->getAttribute('external_id');
                if (! empty($externalCode)) {
                    $optionGroup['externalCode'] = strval($externalCode);
                }

                $itemDTO['optionGroups'][] = $optionGroup;

                $itemDTO['products'][0]['optionGroups'][] = [
                    'id' => $optionGroupId,
                    'min' => (int) $grupoComplemento->getAttribute('qtd_minima'),
                    'max' => (int) $grupoComplemento->getAttribute('qtd_maxima'),
                ];
            }
        }

        Log::debug('upsertItem payload', [
            'item_id' => $item->id,
            'itemDTO' => $itemDTO,
        ]);

        $merchantId = $empresa->integracoes->where('tipo', 'ifood')->value('merchantId');

        $respostaUpsert = Http::withToken($empresa->getAttribute('tokenIfood'))
            ->withHeader('Accept', 'application/json')
            ->put($this->getUpsertItemUrl($merchantId), $itemDTO);

        if (! $respostaUpsert->ok()) {
            Log::warning('Erro ao upsert item no iFood', [
                'error' => json_encode($respostaUpsert->json(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                'payload' => json_encode($itemDTO, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
            ]);
            throw new \Exception('Erro ao sincronizar item com iFood: '.($respostaUpsert->json()['error']['message'] ?? 'Erro desconhecido'));
        }

        return $respostaUpsert->json();
    }

    public function updateStatusItem(
        Empresa $empresa,
        Item $item
    ): void {
        $this->autenticacao($empresa->getAttribute('id'));

        $token = $empresa->getAttribute('tokenIfood');
        $merchantId = $empresa->integracoes->where('tipo', 'ifood')->value('merchantId');

        $corpoReq = [
            'itemId' => $item->itemIfood->getAttribute('item_ifood_id'),
            'status' => $item->trashed() ? 'UNAVAILABLE' : 'AVAILABLE',
            'statusByCatalog' => [],
        ];

        foreach (json_decode($item->categoria->cardapio->importacaoIfood->value('context')) as $contexto) {
            $corpoReq['statusByCatalog'][] = [
                'status' => $item->trashed() ? 'UNAVAILABLE' : 'AVAILABLE',
                'catalogContext' => $contexto,
            ];
        }

        $resposta = Http::withToken($token)
            ->withHeader('Accept', 'application/json')
            ->patch($this->getUpdateItemStatusUrl($merchantId), $corpoReq);

        if (! $resposta->ok()) {
            Log::warning('Erro ao atualizar o status do item dentro do IFOOD: ', [
                'empresa' => $empresa->get([
                    'id',
                    'cnpj',
                    'razao_social',
                ]),
                'item' => $item->get([
                    'id',
                    'nome',
                ]),
                'dados_integracao' => $item->itemIfood->toArray(),
                'motivo' => $resposta->json(),
            ]);
        }
    }

    public function updatePriceItem(
        Empresa $empresa,
        Item $item
    ): void {
        $this->autenticacao($empresa->getAttribute('id'));
        $token = $empresa->getAttribute('tokenIfood');
        $merchantId = Integracao::query()
            ->where('empresa_id', $empresa->getAttribute('id'))
            ->where('tipo', 'ifood')
            ->first()
            ->getAttribute('merchantId');

        $itemDTO = [
            'itemId' => null,
            'price' => [],
            'priceByCatalog' => [],
        ];

        $itemDTO['itemId'] = $item->itemIfood->item_ifood_id;
        $itemDTO['price'] = $item->getAttribute('desconto') ? [
            'value' => (float) $item->getAttribute('valor_desconto'),
            'defaultValue' => (float) $item->getAttribute('preco'),
        ] : [
            'value' => (float) $item->getAttribute('preco'),
        ];

        foreach (json_decode($item->categoria->cardapio->importacaoIfood->context) as $contexto) {
            $itemDTO['priceByCatalog'][] = [
                ...$itemDTO['price'],
                'catalogContext' => $contexto,
            ];
        }

        $resposta = Http::withToken($token)
            ->withHeader('Accept', 'application/json')
            ->withHeader('Content-Type', 'application/json')
            ->patch($this->getUpdatePricePerItemUrl($merchantId), $itemDTO);

        if (! $resposta->ok()) {
            Log::error('Erro ao alterar o preço de um único item', [
                'empresa' => $empresa->first([
                    'id',
                    'nome_fantasia',
                ])->toArray(),
                'item' => $item->first([
                    'id',
                    'nome',
                ])->toArray(),
                'dados_importacao' => $item->itemIfood->toArray(),
                'erro' => $resposta->json(),
            ]);
        }
    }

    public function updateExternalCodeItem(
        Empresa $empresa,
        Item $item
    ): void {
        $this->autenticacao($empresa->getAttribute('id'));
        $token = $empresa->getAttribute('tokenIfood');
        $merchantId = Integracao::query()
            ->where('empresa_id', $empresa->getAttribute('id'))
            ->where('tipo', 'ifood')
            ->first()
            ->getAttribute('merchantId');

        $itemDTO = [
            'itemId' => null,
            'externalCode' => null,
            'externalCodeByCatalog' => [],
        ];

        $itemDTO['itemId'] = $item->itemIfood->item_ifood_id;
        $itemDTO['externalCode'] = $item->getAttribute('external_id');

        foreach (json_decode($item->categoria->cardapio->importacaoIfood->context) as $contexto) {
            $itemDTO['externalCodeByCatalog'][] = [
                'externalCode' => $itemDTO['externalCode'],
                'catalogContext' => $contexto,
            ];
        }

        $resposta = Http::withToken($token)
            ->withHeader('Accept', 'application/json')
            ->withHeader('Content-Type', 'application/json')
            ->patch($this->getUpdateExternalIdPerItemUrl($merchantId), $itemDTO);

        if (! $resposta->ok()) {
            Log::error('Erro ao alterar o external id de um único item', [
                'empresa' => $empresa->first([
                    'id',
                    'nome_fantasia',
                ])->toArray(),
                'item' => $item->first([
                    'id',
                    'nome',
                ])->toArray(),
                'dados_importacao' => $item->itemIfood->toArray(),
                'erro' => $resposta->json(),
            ]);
        }
    }

    /**
     * @throws ConnectionException
     * @throws Exception
     */
    public function updatePriceComplemento(Empresa $empresa, int $complemento_id): void
    {
        $this->autenticacao($empresa->getAttribute('id'));
        $token = $empresa->getAttribute('tokenIfood');
        $merchantId = Integracao::query()
            ->where('empresa_id', $empresa->getAttribute('id'))
            ->where('tipo', 'ifood')
            ->first()
            ->getAttribute('merchantId');
        $complemento = Complemento::query()->findOrFail($complemento_id);

        $complementoDTO = [
            'optionId' => $complemento->complementoIfood->getAttribute('option_id'),
            'price' => [
                'value' => (float) $complemento->getAttribute('preco'),
            ],
            'priceByCatalog' => [],
        ];

        foreach (json_decode($complemento->grupos->item->categoria->cardapio->importacaoIfood->getAttribute('context')) as $contexto) {
            $complementoDTO['priceByCatalog'][] = [
                'value' => (float) $complemento->getAttribute('preco'),
                'catalogContext' => $contexto,
            ];
        }

        $resposta = Http::withToken($token)
            ->withHeader('Accept', 'application/json')
            ->withHeader('Content-Type', 'application/json')
            ->patch($this->getUpdateOptionPriceUrl($merchantId), $complementoDTO);

        if (! $resposta->ok()) {
            Log::error('Erro ao atualizar o preço do complemento no IFOOD', [
                'erro' => $resposta->json(),
                'complementoDTO' => $complementoDTO,
                'complemento' => $complemento->toArray(),
                'empresa' => $empresa->toArray(),
            ]);
            throw new Exception('Erro ao atualizar o preço do complemento no IFOOD');
        }
    }

    public function updateStatusComplemento(Empresa $empresa, int $complemento_id): void
    {
        $this->autenticacao($empresa->getAttribute('id'));
        $token = $empresa->getAttribute('tokenIfood');
        $merchantId = Integracao::query()
            ->where('empresa_id', $empresa->getAttribute('id'))
            ->where('tipo', 'ifood')
            ->first()
            ->getAttribute('merchantId');
        $complemento = Complemento::query()->findOrFail($complemento_id);

        $complementoDTO = [
            'optionId' => $complemento->complementoIfood->getAttribute('option_id'),
            'status' => $complemento->getAttribute('status') ? 'AVAILABLE' : 'UNAVAILABLE',
            'statusByCatalog' => [],
        ];

        foreach (json_decode($complemento->grupos->item->categoria->cardapio->importacaoIfood->getAttribute('context')) as $contexto) {
            $complementoDTO['statusByCatalog'][] = [
                'status' => $complemento->getAttribute('status') ? 'AVAILABLE' : 'UNAVAILABLE',
                'catalogContext' => $contexto,
            ];
        }

        $resposta = Http::withToken($token)
            ->withHeader('Accept', 'application/json')
            ->withHeader('Content-Type', 'application/json')
            ->patch($this->getUpdateOptionStatusUrl($merchantId), $complementoDTO);

        if (! $resposta->ok()) {
            Log::error('Erro ao atualizar o status do complemento no IFOOD', [
                'erro' => $resposta->json(),
                'complementoDTO' => $complementoDTO,
                'complemento' => $complemento->toArray(),
                'empresa' => $empresa->toArray(),
            ]);
            throw new Exception('Erro ao atualizar o status do complemento no IFOOD');
        }
    }

    private function uploadIfoodImagem(
        Empresa $empresa,
        string $imagemUrl,
    ): string {
        $token = $empresa->getAttribute('tokenIfood');
        $merchantId = $empresa->integracoes->where('tipo', 'ifood')->value('merchantId');
        $this->autenticacao($empresa->getAttribute('id'));

        $conteudoImagem = file_get_contents($imagemUrl);
        $conteudoImagemBase64 = base64_encode($conteudoImagem);

        $resposta = Http::withToken($token)
            ->withHeader('Accept', 'application/json')
            ->post($this->getUploadImage($merchantId), [
                'image' => "data:image/png;base64,{$conteudoImagemBase64}",
            ]);

        if (! $resposta->created()) {
            Log::warning('Erro ao fazer upload da imagem para o IFOOD => ', [
                'empresa' => $empresa->get([
                    'id',
                    'razao_social',
                    'cnpj',
                ]),
                'item' => $imagemUrl,
            ]);
        }

        return $resposta->json('imagePath');
    }

    private function criarItemIndustrializado(Categoria $categoria, array $item, bool $importar_preco, bool $importar_imagem, array $dias_funcionamento = []): void
    {
        $itemIndustrializadoCriado = Item::query()->create([
            'external_id' => $item['externalCode'] ?? null,
            'categoria_id' => $categoria->getAttribute('id'),
            'tipo' => 'IND',
            'nome' => $item['name'] ?? null,
            'tipo_preco' => 'fixo',
            'preco' => $importar_preco
                ? ($item['price']['originalValue'] ?? $item['price']['value'])
                : 0,
            'desconto' => $importar_preco ? isset($item['price']['originalValue']) : false,
            'valor_desconto' => $importar_preco && isset($item['price']['originalValue'])
                ? ($item['price']['value'] ?? null)
                : null,
            'porcentagem_desconto' => $this->calcularPorcentagemDesconto($item, $importar_preco),
            'descricao' => trim(($item['description'] ?? '').' '.($item['additionalInformation'] ?? '')),
            'eh_bebida' => false,
            'classificacao' => $this->mapearClassificacoesIfood($item['dietaryRestrictions'] ?? []),
            'dias_funcionamento' => $dias_funcionamento,
            'imagem' => $importar_imagem && ! empty($item['imagePath'])
                ? $this->importarImagemUrl(config('services.mgc.bucket'), $item['imagePath'])
                : null,
        ]);

        ImportacaoItemIfood::query()->create([
            'item_id' => $itemIndustrializadoCriado->getAttribute('id'),
            'item_ifood_id' => $item['id'],
            'product_id' => $item['productId'],
        ]);
    }

    private function criarItemPadrao(
        Categoria $categoria,
        array $item,
        array $dataItem,
        bool $importar_preco,
        bool $importar_complementos,
        bool $importar_imagem,
        array $dias_funcionamento = []
    ): void {
        $itemCriado = Item::query()->create([
            'external_id' => empty($item['externalCode']) ? null : $item['externalCode'],
            'categoria_id' => $categoria->getAttribute('id'),
            'tipo' => 'PRE',
            'nome' => $item['name'] ?? null,
            'tipo_preco' => 'fixo',
            'preco' => $importar_preco
                ? ($item['price']['originalValue'] ?? $item['price']['value'])
                : 0,
            'desconto' => $importar_preco ? isset($item['price']['originalValue']) : false,
            'valor_desconto' => $importar_preco && isset($item['price']['originalValue'])
                ? ($item['price']['value'] ?? null)
                : null,
            'porcentagem_desconto' => $this->calcularPorcentagemDesconto($item, $importar_preco),
            'descricao' => $dataItem['description'] ?? null,
            'qtde_pessoas' => null,
            'peso' => $dataItem['weight']['quantity'] ?? null,
            'gramagem' => $dataItem['weight']['unit'] ?? null,
            'eh_bebida' => false,
            'classificacao' => $this->mapearClassificacoesIfood($dataItem['dietaryRestrictions'] ?? []),
            'dias_funcionamento' => $dias_funcionamento,
            'imagem' => $importar_imagem && ! empty($dataItem['image'])
                ? $this->importarImagemUrl(config('services.mgc.bucket'), $dataItem['image'])
                : null,
        ]);

        if ($importar_complementos && isset($dataItem['optionGroups'])) {
            $this->criarComplementos($itemCriado, $dataItem['optionGroups']);
        }

        ImportacaoItemIfood::query()->create([
            'item_id' => $itemCriado->getAttribute('id'),
            'item_ifood_id' => $item['id'],
            'product_id' => $item['productId'],
        ]);
    }

    private function criarComplementos(Item $item, array $gruposComplemento): void
    {
        foreach ($gruposComplemento as $grupoComplemento) {
            $grupoComplementoCriado = GrupoComplemento::query()->create([
                'item_id' => $item->getAttribute('id'),
                'nome' => $grupoComplemento['name'],
                'obrigatoriedade' => $grupoComplemento['min'] >= 1,
                'qtd_minima' => $grupoComplemento['min'],
                'qtd_maxima' => $grupoComplemento['max'],
            ]);

            ImportacaoGrupoComplementoIfood::query()->create([
                'grupo_id' => $grupoComplementoCriado->getAttribute('id'),
                'option_group_id' => $grupoComplemento['id'],
            ]);

            foreach ($grupoComplemento['options'] as $complemento) {
                $complementoCriado = Complemento::query()->create([
                    'external_id' => empty($complemento['externalCode']) ? null : $complemento['externalCode'],
                    'grupo_id' => $grupoComplementoCriado->getAttribute('id'),
                    'nome' => $complemento['name'],
                    'descricao' => null,
                    'preco' => $complemento['price']['value'] ?? 0,
                    'status' => true,
                ]);

                ImportacaoComplementoIfood::query()->create([
                    'complemento_id' => $complementoCriado->getAttribute('id'),
                    'option_id' => $complemento['id'],
                    'product_id' => $complemento['productId'],
                ]);
            }
        }
    }

    private function criarItemPizza(
        Categoria $categoria,
        array $item,
        array $dataItem,
        string $merchantId,
        string $token,
        array $dias_funcionamento = []
    ): void {
        $sabores = [];

        foreach ($dataItem['optionGroups'] as $opcao) {
            $nomeOpcao = strtolower($opcao['name']);

            if ($nomeOpcao === 'tamanho') {
                $sabores = $this->processarTamanhos($categoria, $opcao['options'], $merchantId, $token);
            } elseif ($nomeOpcao === 'massa') {
                $this->processarMassas($categoria, $opcao['options']);
            } elseif ($nomeOpcao === 'borda') {
                $this->processarBordas($categoria, $opcao['options']);
            }
        }

        $this->processarSabores($categoria, $item, $sabores, $dias_funcionamento);
    }

    private function processarTamanhos(
        Categoria $categoria,
        array $tamanhos,
        string $merchantId,
        string $token
    ): array {
        $sabores = [];

        foreach ($tamanhos as $tamanho) {
            $respostaTamanho = Http::withToken($token)
                ->withHeader('Accept', 'application/json')
                ->get($this->getProductById($merchantId, $tamanho['productId']));

            if (! $respostaTamanho->ok()) {
                continue;
            }

            $dataTamanho = $respostaTamanho->json();

            $categoriaTamanho = CategoriaTamanho::query()->create([
                'external_id' => $tamanho['externalCode'] ?? null,
                'categoria_id' => $categoria->getAttribute('id'),
                'nome' => $tamanho['name'] ?? '',
                'qtde_pedacos' => $dataTamanho['weight']['quantity'] ?? 0,
                'qtde_sabores' => [1],
            ]);

            if (isset($tamanho['optionGroups'][0]['options'])) {
                foreach ($tamanho['optionGroups'][0]['options'] as $sabor) {
                    $sabores[$categoriaTamanho->getAttribute('id')][] = [
                        'productId' => $sabor['productId'],
                        'preco' => $sabor['price']['value'] ?? 0,
                    ];
                }
            }
        }

        return $sabores;
    }

    private function processarMassas(Categoria $categoria, array $massas): void
    {
        foreach ($massas as $massa) {
            CategoriaMassa::query()->create([
                'external_id' => $massa['externalCode'] ?? null,
                'categoria_id' => $categoria->getAttribute('id'),
                'nome' => $massa['name'],
                'preco' => $massa['price']['value'] ?? 0,
            ]);
        }
    }

    private function processarBordas(Categoria $categoria, array $bordas): void
    {
        foreach ($bordas as $borda) {
            CategoriaBorda::query()->create([
                'external_id' => $borda['externalCode'] ?? null,
                'categoria_id' => $categoria->getAttribute('id'),
                'nome' => $borda['name'],
                'preco' => $borda['price']['value'] ?? 0,
            ]);
        }
    }

    private function processarSabores(Categoria $categoria, array $item, array $sabores, array $dias_funcionamento = []): void
    {
        $mapaSabores = [];

        foreach ($item['optionGroups'] as $opcoesItem) {
            if (strtolower($opcoesItem['name']) !== 'sabores') {
                continue;
            }

            foreach ($opcoesItem['options'] as $saborPizza) {
                $itemPizza = Item::query()->create([
                    'external_id' => $saborPizza['externalCode'] ?? null,
                    'categoria_id' => $categoria->getAttribute('id'),
                    'tipo' => 'PIZ',
                    'nome' => $saborPizza['name'] ?? null,
                    'tipo_preco' => 'preco_item',
                    'preco' => 0,
                    'desconto' => false,
                    'valor_desconto' => null,
                    'porcentagem_desconto' => 0,
                    'descricao' => null,
                    'qtde_pessoas' => null,
                    'peso' => null,
                    'gramagem' => null,
                    'eh_bebida' => false,
                    'classificacao' => [],
                    'dias_funcionamento' => $dias_funcionamento,
                    'imagem' => null,
                ]);

                ImportacaoItemIfood::query()->create([
                    'item_id' => $itemPizza->getAttribute('id'),
                    'item_ifood_id' => $saborPizza['id'],
                    'product_id' => $saborPizza['productId'],
                ]);

                // Mapeia o productId antigo para o novo item_id
                foreach ($sabores as $tamanhoId => $saboresTamanho) {
                    foreach ($saboresTamanho as $sabor) {
                        if ($sabor['productId'] === $saborPizza['productId']) {
                            $mapaSabores[$tamanhoId][] = [
                                'item_id' => $itemPizza->getAttribute('id'),
                                'preco' => $sabor['preco'],
                            ];
                        }
                    }
                }
            }
        }

        // Cria os preços dos itens
        foreach ($mapaSabores as $tamanhoId => $saboresPreco) {
            foreach ($saboresPreco as $saborPreco) {
                ItemPreco::query()->create([
                    'tamanho_id' => $tamanhoId,
                    'item_id' => $saborPreco['item_id'],
                    'preco' => $saborPreco['preco'],
                    'status' => true,
                ]);
            }
        }
    }

    private function buscarDadosPlanos(string $merchantId, string $categoryId, string $token): array
    {
        $resposta = Http::withToken($token)
            ->withHeader('Accept', 'application/json')
            ->get($this->getCategoryItems($merchantId, $categoryId));

        if (! $resposta->ok()) {
            return ['items' => [], 'produtos' => [], 'grupos' => [], 'opcoes' => []];
        }

        $dados = $resposta->json();

        return [
            'items' => collect($dados['items'] ?? [])->keyBy('id')->toArray(),
            'produtos' => collect($dados['products'] ?? [])->keyBy('id')->toArray(),
            'grupos' => collect($dados['optionGroups'] ?? [])->keyBy('id')->toArray(),
            'opcoes' => collect($dados['options'] ?? [])->keyBy('id')->toArray(),
        ];
    }

    private function montarDataItemDePlano(array $produto, array $dadosPlanos): array
    {
        $optionGroups = [];

        foreach ($produto['optionGroups'] ?? [] as $ogRef) {
            $og = $dadosPlanos['grupos'][$ogRef['id']] ?? null;
            if (! $og) {
                continue;
            }

            $options = [];
            foreach ($og['optionIds'] ?? [] as $optionId) {
                $opt = $dadosPlanos['opcoes'][$optionId] ?? null;
                if (! $opt) {
                    continue;
                }
                $optProduto = $dadosPlanos['produtos'][$opt['productId']] ?? null;

                $options[] = [
                    'id' => $opt['id'],
                    'name' => $optProduto['name'] ?? '',
                    'externalCode' => empty($opt['contextModifiers'][0]['externalCode'] ?? '') ? null : $opt['contextModifiers'][0]['externalCode'],
                    'productId' => $opt['productId'],
                    'status' => $opt['status'] ?? 'AVAILABLE',
                    'price' => [
                        'value' => $opt['contextModifiers'][0]['price']['value'] ?? $opt['price']['value'] ?? 0,
                    ],
                ];
            }

            $optionGroups[] = [
                'id' => $og['id'],
                'name' => $og['name'],
                'min' => $og['min'],
                'max' => $og['max'],
                'options' => $options,
            ];
        }

        return [
            'description' => $produto['description'] ?? null,
            'weight' => null,
            'dietaryRestrictions' => $produto['dietaryRestrictions'] ?? [],
            'image' => $produto['imagePath'] ?? null,
            'optionGroups' => $optionGroups,
        ];
    }

    private function criarCombo(
        Categoria $categoria,
        array $item,
        string $merchantId,
        string $token,
        bool $importar_preco,
        bool $importar_imagem,
        array $dias_funcionamento = []
    ): void {
        $respostaFlat = Http::withToken($token)
            ->withHeader('Accept', 'application/json')
            ->get($this->getItemFlat($merchantId, $item['id']));

        if (! $respostaFlat->ok()) {
            return;
        }

        $flat = $respostaFlat->json();
        $produto = collect($flat['products'] ?? [])->firstWhere('id', $item['productId']) ?? [];
        $gruposIndexados = collect($flat['optionGroups'] ?? [])->keyBy('id');
        $opcoesIndexadas = collect($flat['options'] ?? [])->keyBy('id');
        $produtosIndexados = collect($flat['products'] ?? [])->keyBy('id');

        $gruposMain = collect($produto['optionGroups'] ?? [])
            ->where('associationType', 'MAIN')
            ->pluck('id')
            ->flip();

        $precoCombo = $importar_preco ? ($item['price']['originalValue'] ?? $item['price']['value'] ?? 0) : 0;
        $tipoPrecificacao = $precoCombo > 0 ? 'preco_combo' : 'preco_item';

        $comboCriado = Combo::query()->create([
            'categoria_id' => $categoria->getAttribute('id'),
            'nome' => $item['name'],
            'external_id' => empty($item['externalCode']) ? null : $item['externalCode'],
            'descricao' => $produto['description'] ?? null,
            'preco' => $precoCombo,
            'tipo_preco' => $tipoPrecificacao,
            'classificacao' => $this->mapearClassificacoesIfood($item['dietaryRestrictions'] ?? []),
            'dias_funcionamento' => $dias_funcionamento,
            'imagem' => $importar_imagem && ! empty($item['imagePath'])
                ? $this->importarImagemUrl(config('services.mgc.bucket'), $item['imagePath'])
                : null,
        ]);

        ComboMeta::query()->create([
            'combo_id' => $comboCriado->getAttribute('id'),
            'tipo_precificacao' => $tipoPrecificacao,
            'preco_combo' => $precoCombo,
            'desconto_combo' => false,
        ]);

        ImportacaoItemIfood::query()->create([
            'item_id' => $comboCriado->getAttribute('id'),
            'item_ifood_id' => $item['id'],
            'product_id' => $item['productId'],
        ]);

        foreach ($produto['optionGroups'] ?? [] as $index => $ogRef) {
            $og = $gruposIndexados[$ogRef['id']] ?? null;
            if (! $og) {
                continue;
            }

            $isMain = isset($gruposMain[$ogRef['id']]);

            $comboGrupo = ComboGrupo::query()->create([
                'combo_id' => $comboCriado->getAttribute('id'),
                'nome' => $og['name'],
                'qtd_maxima' => $ogRef['max'],
                'ordem' => $index,
                'configuracao' => ['min' => $ogRef['min'], 'max' => $ogRef['max']],
            ]);

            foreach ($og['optionIds'] as $optionId) {
                $opcao = $opcoesIndexadas[$optionId] ?? null;
                if (! $opcao) {
                    continue;
                }

                $produtoOpcao = $produtosIndexados[$opcao['productId']] ?? null;
                $nomeSnapshot = $produtoOpcao['name'] ?? null;
                $precoSnapshot = $opcao['contextModifiers'][0]['price']['value'] ?? $opcao['price']['value'] ?? 0;

                $tipo = 'item';
                if ($isMain) {
                    $referenciaId = ImportacaoItemIfood::query()->where('product_id', $opcao['productId'])->value('item_id');
                } else {
                    $referenciaId = ImportacaoComplementoIfood::query()->where('product_id', $opcao['productId'])->value('complemento_id')
                        ?? ImportacaoItemIfood::query()->where('product_id', $opcao['productId'])->value('item_id');
                }

                ComboEntrada::query()->create([
                    'combo_id' => $comboCriado->getAttribute('id'),
                    'tipo' => $tipo,
                    'combo_grupo_id' => $comboGrupo->getAttribute('id'),
                    'grupo_complemento_id' => null,
                    'referencia_id' => $referenciaId,
                    'nome_snapshot' => $nomeSnapshot,
                    'preco_snapshot' => $precoSnapshot,
                ]);
            }
        }
    }

    private function calcularPorcentagemDesconto(array $item, bool $importar_preco): float
    {
        if (! $importar_preco) {
            return 0;
        }

        $precoOriginal = $item['price']['originalValue'] ?? 0;
        $precoAtual = $item['price']['value'] ?? 0;

        if ($precoOriginal <= 0) {
            return 0;
        }

        return round(100 - (($precoAtual / $precoOriginal) * 100), 2);
    }

    private function consultaCatalogos(int $empresa_id, string $merchantId): array
    {
        $resposta = Http::withToken(Empresa::query()->findOrFail($empresa_id)->tokenIfood)->withHeader('Accept', 'application/json')->get(
            $this->getListAllCatalogsFromMerchant($merchantId)
        );

        return $resposta->json();
    }

    /**
     * @throws ConnectionException
     */
    private function enviaRespostaDeRecebimento(int $empresa_id): void
    {
        $this->autenticacao($empresa_id);

        $pedidos = PedidoIntegracaoIfood::query()->where('empresa_id', $empresa_id)->where('viewed_at', null)->get(['uuid'])->map(fn ($p) => ['id' => $p->uuid]);

        if (! $pedidos->isEmpty()) {
            $resposta = Http::withToken(Empresa::query()->findOrFail($empresa_id)->tokenIfood)->withHeaders([
                'accept' => 'application/json',
            ])->post($this->urlBaseEventos.$this->ackEvents, $pedidos);

            if ($resposta->accepted()) {
                PedidoIntegracaoIfood::query()->where('empresa_id', $empresa_id)->where('viewed_at', null)->update([
                    'viewed_at' => Carbon::now(),
                ]);
            }
        }
    }

    private function consultaDadosPedidoIFOOD(int $empresa_id): void
    {
        $this->autenticacao($empresa_id);

        foreach (PedidoIntegracaoIfood::query()->doesntHave('pedido')->where('fullCode', 'PLACED')->whereNot('viewed_at', null)->get() as $pedido) {
            $resposta = Http::withToken(Empresa::query()->findOrFail($empresa_id)->tokenIfood)->withHeaders([
                'accept' => 'application/json',
            ])->get($this->urlBaseOrders.$this->getDetailsOrderWithOrderID($pedido->orderId));

            if (! $resposta->ok()) {
                Log::error('IFOOD consultaDadosPedido: falha ao buscar detalhes do pedido', [
                    'orderId' => $pedido->orderId,
                    'empresa_id' => $empresa_id,
                    'status' => $resposta->status(),
                    'body' => $resposta->json(),
                ]);

                continue;
            }

            $detalhesPedidoIfood = $resposta->json();

            Log::info('IFOOD consultaDadosPedido: detalhes recebidos', [
                'orderId' => $pedido->orderId,
                'orderType' => $detalhesPedidoIfood['orderType'] ?? null,
                'orderTiming' => $detalhesPedidoIfood['orderTiming'] ?? null,
            ]);

            try {
                $tipoPedidoIfood = $detalhesPedidoIfood['orderType'];
                $ehDelivery = $tipoPedidoIfood === 'DELIVERY';
                $enderecoEntregaIfood = null;
                $dadosRetiradaIfood = null;
                $dadosDescontoIfood = null;

                $consultaCliente = DB::table('clientes');
                if (isset($detalhesPedidoIfood['customer']['documentNumber'])) {
                    $consultaCliente = $consultaCliente->orWhereRaw("REGEXP_REPLACE(cpf_cnpj, '[^0-9]', '') = ?", [$detalhesPedidoIfood['customer']['documentNumber']])->first();
                } elseif (isset($detalhesPedidoIfood['customer']['phone']['number'])) {
                    $consultaCliente = $consultaCliente->orWhereRaw("REGEXP_REPLACE(telefone, '[^0-9]', '') = ?", [preg_replace('/\D/', '', $detalhesPedidoIfood['customer']['phone']['number'])])->first();
                } else {
                    $consultaCliente = null;
                }

                if ($ehDelivery) {
                    $enderecoEntregaIfood = Endereco::query()->create([
                        'logradouro' => $detalhesPedidoIfood['delivery']['deliveryAddress']['streetName'],
                        'bairro' => $detalhesPedidoIfood['delivery']['deliveryAddress']['neighborhood'],
                        'cidade' => $detalhesPedidoIfood['delivery']['deliveryAddress']['city'],
                        'uf' => $detalhesPedidoIfood['delivery']['deliveryAddress']['state'],
                        'cep' => $detalhesPedidoIfood['delivery']['deliveryAddress']['postalCode'],
                        'numero' => intval($detalhesPedidoIfood['delivery']['deliveryAddress']['streetNumber']),
                    ]);
                }

                $eh_agendado = ($detalhesPedidoIfood['orderTiming'] ?? '') === 'SCHEDULED';
                $eh_prioridade = $ehDelivery && ($detalhesPedidoIfood['delivery']['mode'] ?? '') === 'TURBO/PRIORITY';
                $dadosPedido = [
                    'ifood_display_id' => $detalhesPedidoIfood['displayId'],
                    'pedido_ifood_id' => $detalhesPedidoIfood['id'],
                    'ifood_entregue_por' => $ehDelivery ? ($detalhesPedidoIfood['delivery']['deliveredBy'] ?? null) : null,
                    'endereco_entrega_ifood' => $enderecoEntregaIfood ? $enderecoEntregaIfood->id : null,
                    'comanda' => uuid_create(),
                    'tipo' => $ehDelivery ? 'D' : 'R',
                    'empresa_id' => $empresa_id,
                    'valor_frete' => $detalhesPedidoIfood['total']['deliveryFee'] ?? 0,
                    'prioridade' => $eh_prioridade,
                    'eh_agendado' => $eh_agendado,
                    'data_agendamento_inicio' => $eh_agendado ? Carbon::parse($detalhesPedidoIfood['schedule']['deliveryDateTimeStart']) : null,
                    'data_agendamento_fim' => $eh_agendado ? Carbon::parse($detalhesPedidoIfood['schedule']['deliveryDateTimeEnd']) : null,
                    'data_inicio_preparo' => $eh_agendado ? ($detalhesPedidoIfood['schedule']['preparationStartDateTime'] ?? null) : null,
                    'codigo_coleta' => $ehDelivery ? ($detalhesPedidoIfood['delivery']['pickupCode'] ?? null) : null,
                    'observacao' => $ehDelivery ? ($detalhesPedidoIfood['delivery']['observations'] ?? null) : null,
                ];

                if (Configuracao::whereEmpresaId($empresa_id)->whereConfiguracao('aceite_automatico_ifood')->first()->valor) {
                    $this->aceitarPedidoIfood($empresa_id, $detalhesPedidoIfood['id']);
                    $dadosPedido['status'] = 'sendo preparado';
                } else {
                    $dadosPedido['status'] = 'pendente';
                }

                if ($consultaCliente !== null) {
                    $dadosPedido['cliente_id'] = $consultaCliente->id;
                } else {
                    $dadosPedido['nome'] = $detalhesPedidoIfood['customer']['name'];
                    $dadosPedido['telefone'] = preg_replace('/\D/', '', $detalhesPedidoIfood['customer']['phone']['number']);
                    $dadosPedido['cpf_cnpj_ifood'] = isset($detalhesPedidoIfood['customer']['documentNumber']) ? preg_replace('/\D/', '', $detalhesPedidoIfood['customer']['documentNumber']) : null;
                }

                $pedidoCriado = Pedido::query()->create($dadosPedido);

                if (isset($detalhesPedidoIfood['benefits'])) {
                    foreach ($detalhesPedidoIfood['benefits'] as $benefit) {
                        $alvo = \App\Enums\AlvoDescontoIfoodEnum::tryFrom($benefit['target'] ?? null);

                        $resp = collect($benefit['sponsorshipValues'] ?? [])
                            ->firstWhere('value', '>', 0);

                        $patrocinio = \App\Enums\PatrocinioDescontoIfoodEnum::tryFrom($resp['name'] ?? null);

                        $dadosDescontoIfood[] = [
                            'alvo_desconto' => $alvo,
                            'alvo_id' => $alvo?->exigeTargetId() ? ($benefit['targetId'] ?? null) : null,
                            'valor' => (float) ($benefit['value'] ?? 0),
                            'responsavel_desconto' => $patrocinio,         // enum ou null
                            'meta' => [
                                'campaign' => $benefit['campaign'] ?? null,
                                // opcional: 'raw' => $benefit, // se quiser guardar tudo
                            ],
                        ];
                    }
                    $pedidoCriado->cuponsUsadoNoIfood()->createMany($dadosDescontoIfood);
                }

                if ($tipoPedidoIfood === 'TAKEOUT') {
                    $dadosRetiradaIfood = [
                        'mode' => ModoRetiradaEnum::tryFrom($detalhesPedidoIfood['takeout']['mode']),
                        'takeout_datetime' => Carbon::parse($detalhesPedidoIfood['takeout']['takeoutDateTime']),
                        'location_type' => TipoLugarRetiradaEnum::tryFrom($detalhesPedidoIfood['takeout']['location']['type']),
                    ];
                    $pedidoCriado->dadosRetiradaPedido()->create($dadosRetiradaIfood);
                }

                foreach ($detalhesPedidoIfood['items'] as $item) {
                    $isCombo = ($item['type'] ?? '') === 'COMBO_V2';

                    $pedidoItemCriado = PedidoItem::query()->create([
                        'pedido_id' => $pedidoCriado->id,
                        'uuid' => uuid_create(),
                        'nome' => $item['name'],
                        'external_id' => ! empty($item['externalCode']) ? $item['externalCode'] : null,
                        'tipo' => match ($item['type'] ?? '') {
                            'LEGACY_PIZZA' => 'P',
                            'COMBO_V2' => 'C',
                            default => 'I',
                        },
                        'tipo_preco' => $isCombo ? 'preco_item' : null,
                        'quantidade' => $item['quantity'],
                        'preco_unitario' => $item['unitPrice'],
                        'subtotal' => $item['totalPrice'],
                        'observacao' => ! empty($item['observations']) ? $item['observations'] : null,
                    ]);

                    if (isset($item['options'])) {
                        if ($isCombo) {
                            foreach ($item['options'] as $option) {
                                if (($option['type'] ?? '') === 'MAIN') {
                                    $comboItemCriado = PedidoComboItem::query()->create([
                                        'pedido_item_id' => $pedidoItemCriado->id,
                                        'uuid' => uuid_create(),
                                        'external_id' => ! empty($option['externalCode']) ? $option['externalCode'] : null,
                                        'tipo' => 'item',
                                        'grupo_nome' => $option['groupName'],
                                        'item_nome' => $option['name'],
                                        'qtde' => $option['quantity'],
                                        'preco_unitario' => $option['unitPrice'],
                                    ]);

                                    foreach ($option['customizations'] ?? [] as $customization) {
                                        PedidoComboItemCustomizacao::query()->create([
                                            'pedido_combo_item_id' => $comboItemCriado->id,
                                            'uuid' => uuid_create(),
                                            'external_id' => ! empty($customization['externalCode']) ? $customization['externalCode'] : null,
                                            'grupo_nome' => $customization['groupName'],
                                            'nome' => $customization['name'],
                                            'qtde' => $customization['quantity'],
                                            'preco_unitario' => $customization['unitPrice'],
                                        ]);
                                    }
                                } else {
                                    PedidoComboItem::query()->create([
                                        'pedido_item_id' => $pedidoItemCriado->id,
                                        'uuid' => uuid_create(),
                                        'external_id' => ! empty($option['externalCode']) ? $option['externalCode'] : null,
                                        'tipo' => 'complemento',
                                        'grupo_nome' => $option['groupName'],
                                        'item_nome' => $option['name'],
                                        'qtde' => $option['quantity'],
                                        'preco_unitario' => $option['unitPrice'],
                                    ]);
                                }
                            }
                        } else {
                            foreach ($item['options'] as $complemento) {
                                PedidoComplemento::query()->create([
                                    'pedido_item_id' => $pedidoItemCriado->id,
                                    'uuid' => uuid_create(),
                                    'external_id' => ! empty($complemento['externalCode']) ? $complemento['externalCode'] : null,
                                    'nome' => $complemento['name'],
                                    'qtde' => $complemento['quantity'],
                                    'preco_unitario' => $complemento['unitPrice'],
                                ]);
                            }
                        }
                    }
                }

                $financeiroDados = [
                    'uuid' => uuid_create(),
                    'pedido_id' => $pedidoCriado->id,
                    'total' => $detalhesPedidoIfood['payments']['prepaid'] !== 0 ? $detalhesPedidoIfood['payments']['prepaid'] : $detalhesPedidoIfood['payments']['pending'],
                    'adicional' => $detalhesPedidoIfood['total']['additionalFees'],
                    'subtotal_itens_ifood' => $detalhesPedidoIfood['total']['subTotal'],
                ];

                $financeiroDados['forma_pagamento'] = match ($detalhesPedidoIfood['payments']['methods'][0]['method']) {
                    'CASH' => 'Dinheiro',
                    'BANK_DRAFT' => 'Cheque bancário',
                    'CREDIT' => 'Cartão de Crédito - '.$detalhesPedidoIfood['payments']['methods'][0]['card']['brand'],
                    'DEBIT' => 'Cartão de Débito - '.$detalhesPedidoIfood['payments']['methods'][0]['card']['brand'],
                    'MEAL_VOUCHER' => 'Vale Refeição - '.$detalhesPedidoIfood['payments']['methods'][0]['card']['brand'],
                    default => $detalhesPedidoIfood['payments']['methods'][0]['method']
                };

                if ($financeiroDados['forma_pagamento'] === 'Dinheiro') {
                    $financeiroDados['troco_para'] = $detalhesPedidoIfood['payments']['methods'][0]['cash']['changeFor'];
                    $financeiroDados['valor_troco'] = $detalhesPedidoIfood['payments']['methods'][0]['cash']['changeFor'] - $detalhesPedidoIfood['payments']['pending'];
                }

                FinanceiroPedido::query()->create($financeiroDados);
            } catch (Exception $e) {
                Log::warning("Erro no cadastro dos dados do pedido: $pedido->orderId; ".$e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }
    }

    public function aceitarPedidoIfood(int $empresa_id, string $order_id): void
    {
        $this->autenticacao($empresa_id);

        Http::withToken(Empresa::query()->findOrFail($empresa_id)->tokenIfood)->withHeaders([
            'accept' => 'application/json',
        ])->post($this->urlBaseOrders.$this->getAcceptOrderWithOrderID($order_id));
    }

    public function prontoParaRetiradaPedidoIfood(int $empresa_id, string $order_id): void
    {
        $this->autenticacao($empresa_id);

        Http::withToken(Empresa::query()->findOrFail($empresa_id)->tokenIfood)->withHeaders([
            'accept' => 'application/json',
        ])->post($this->urlBaseOrders.$this->getReadyToPickupWithOrderID($order_id));
    }

    public function dispacharPedidoIfood(int $empresa_id, string $order_id): void
    {
        $this->autenticacao($empresa_id);

        Http::withToken(Empresa::query()->findOrFail($empresa_id)->tokenIfood)->withHeaders([
            'accept' => 'application/json',
        ])->post($this->urlBaseOrders.$this->getDispatchOrderWithOrderID($order_id));
    }

    public function solicitarMotivosCancelamentoIfood(int $empresa_id, string $order_id): Response
    {
        $this->autenticacao($empresa_id);

        return Http::withToken(Empresa::query()->findOrFail($empresa_id)->tokenIfood)->withHeaders([
            'accept' => 'application/json',
        ])->get($this->urlBaseOrders.$this->getCancellationReasons($order_id));
    }

    public function solicitarCancelamentoIfood(int $empresa_id, string $order_id, string $motivo, string $codigo): Response
    {
        $this->autenticacao($empresa_id);

        return Http::withToken(Empresa::query()->findOrFail($empresa_id)->tokenIfood)->withHeaders([
            'accept' => '*/*',
            'Content-Type' => 'application/json',
        ])->post($this->urlBaseOrders.$this->getRequestCancellation($order_id), [
            'reason' => $motivo,
            'cancellationCode' => $codigo,
        ]);
    }

    public function enviaRespostaNegociacao(int $empresa_id, string $dispute_id, array $dados): array
    {
        $this->autenticacao($empresa_id);

        try {
            $token = Empresa::query()->findOrFail($empresa_id)->tokenIfood;

            match ($dados['decisao']) {
                'aceitar' => $this->processarAceite($token, $dispute_id),
                'recusar' => $this->processarRecusa($token, $dispute_id, $dados),
                'proposta' => $this->processarProposta($token, $dispute_id, $dados),
                default => throw new \InvalidArgumentException('Decisão inválida')
            };

            return [
                'success' => true,
                'message' => 'Solicitação encaminhada, por favor, espere o retorno do IFOOD',
                'description' => 'Quando for concluído com sucesso, a notificação receberá a informação e se atualizará.',
            ];
        } catch (Exception $e) {
            Log::error('Erro ao enviar resposta de negociação para o IFOOD', [
                'empresa_id' => $empresa_id,
                'dispute_id' => $dispute_id,
                'decisao' => $dados['decisao'] ?? null,
                'erro' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function verificaCodigoColeta(int $empresa_id, string $ifood_pedido_id, string $codigoInformado): array
    {
        $this->autenticacao($empresa_id);

        $token = Empresa::query()->find($empresa_id)->getAttribute('tokenIfood');

        $response = Http::withToken($token)
            ->withHeader('Accept', 'application/jso')
            ->post($this->urlBaseOrders.$this->validatePickupCode($ifood_pedido_id), [
                'code' => $codigoInformado,
            ]);

        if ($response->notFound()) {
            return [
                'code' => 404,
                'mensagem' => 'Código inválido',
            ];
        }

        if ($response->serverError()) {
            $data = $response->json();
            Log::error("Erro ao consultar o código de retirada: $codigoInformado ; UUID Pedido Ifood => $ifood_pedido_id", $data);

            return [
                'code' => 500,
                'mensagem' => 'Erro ao consultar o código de retirada, entrar em contato com o suporte',
            ];
        }

        return [
            'code' => 200,
            'mensagem' => 'Código validado com sucesso',
        ];
    }

    private function processarAceite(string $token, string $dispute_id): void
    {
        Http::withToken($token)
            ->withHeaders($this->getDefaultHeaders())
            ->post($this->urlBaseOrders.$this->getHandshakeAccept($dispute_id), []);
    }

    private function processarRecusa(string $token, string $dispute_id, array $dados): void
    {
        Http::withToken($token)
            ->withHeaders($this->getDefaultHeaders())
            ->post($this->urlBaseOrders.$this->getHandshakeDeny($dispute_id), [
                'reason' => $dados['razao'],
            ]);
    }

    private function processarProposta(string $token, string $dispute_id, array $dados): void
    {
        $payload = $this->montarPayloadProposta($dados);

        Http::withToken($token)
            ->withHeaders($this->getDefaultHeaders())
            ->post(
                $this->urlBaseOrders.$this->getHandshakeCounterProposal($dispute_id, $dados['alternative_id']),
                $payload
            );
    }

    private function montarPayloadProposta(array $dados): array
    {
        if ($dados['tipo_proposta'] === 'DELAY') {
            return [
                'type' => 'ADDITIONAL_TIME',
                'metadata' => [
                    'additionalTimeInMinutes' => $dados['minutos_adicionais'],
                    'additionalTimeReason' => $dados['motivo'],
                ],
            ];
        }

        if (in_array($dados['tipo_proposta'], ['AFTER_DELIVERY', 'AFTER_DELIVERY_PARTIALLY'])) {
            return [
                'type' => $dados['tipo_reembolso'],
                'metadata' => [
                    'amount' => [
                        'currency' => $dados['tipo_moeda'],
                        'value' => strval($dados['valor_contraproposta'] * 100),
                    ],
                ],
            ];
        }

        throw new \InvalidArgumentException('Tipo de proposta inválido');
    }

    private function getDefaultHeaders(): array
    {
        return [
            'accept' => '*/*',
            'Content-Type' => 'application/json',
        ];
    }

    private function tokenAindaValido(int $empresa_id): bool
    {
        return Empresa::query()->findOrFail($empresa_id)->lifetimeTokenIfood >= now();
    }

    private function obterIntegracaoIfood(int $empresa_id): ?Integracao
    {
        $integracao = Integracao::where('empresa_id', $empresa_id)
            ->where('tipo', 'ifood')
            ->first();

        if (! $integracao || ! $integracao->clientId || ! $integracao->clientSecret) {
            return null;
        }

        return $integracao;
    }

    private function mapearClassificacoesIfood(array $dietaryRestrictions): array
    {
        // Mapeamento iFood -> Sistema
        $mapeamento = [
            'VEGETARIAN' => 'vegetariano',
            'VEGAN' => 'vegano',
            'ORGANIC' => 'organico',
            'SUGAR_FREE' => 'sem_acucar',
            'LAC_FREE' => 'zero_lactose',
            'ALCOHOLIC_DRINK' => 'bebida_alcoolica',
            'NATURAL' => 'bebida_natural',
        ];

        // Marca como true as classificações que vieram do iFood
        $classificacoesAtivas = [];
        foreach ($dietaryRestrictions as $restricao) {
            $campoSistema = $mapeamento[$restricao] ?? null;
            if ($campoSistema) {
                $classificacoesAtivas[] = $campoSistema;
            }
        }

        // Atualiza o array de classificação
        return $classificacoesAtivas;
    }

    private function mapearClassificacoesParaIfood(array $classificacoesSistema): array
    {
        // Mapeamento Sistema -> iFood
        $mapeamento = [
            'vegetariano' => 'VEGETARIAN',
            'vegano' => 'VEGAN',
            'organico' => 'ORGANIC',
            'sem_acucar' => 'SUGAR_FREE',
            'zero_lactose' => 'LAC_FREE',
            'bebida_alcoolica' => 'ALCOHOLIC_DRINK',
            'bebida_natural' => 'NATURAL',
        ];

        $dietaryRestrictions = [];

        foreach ($classificacoesSistema as $classificacao) {
            $codigoIfood = $mapeamento[$classificacao] ?? null;
            if ($codigoIfood) {
                $dietaryRestrictions[] = $codigoIfood;
            }
        }

        return $dietaryRestrictions;
    }

    private function garantirCategoriaIfood(Categoria $categoria): void
    {
        if ($categoria->categoriaIfood) {
            return;
        }

        $categoryId = $categoria->importacao_id;

        if (! $categoryId) {
            $categoryId = Str::uuid()->toString();
            $categoria->update(['importacao_id' => $categoryId]);
        }

        $categoria->categoriaIfood()->create([
            'category_id' => $categoryId,
        ]);

        $categoria->load('categoriaIfood');
    }
}
