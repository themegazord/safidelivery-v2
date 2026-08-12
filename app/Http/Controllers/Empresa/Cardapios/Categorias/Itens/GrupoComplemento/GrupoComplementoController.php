<?php

namespace App\Http\Controllers\Empresa\Cardapios\Categorias\Itens\GrupoComplemento;

use App\Actions\GrupoComplementos\CopiaGrupoComplementoAction;
use App\Actions\GrupoComplementos\BuscaComplementosParaCopiaAction;
use App\Actions\GrupoComplementos\StoreGrupoComplementoAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cardapios\Categorias\Itens\GrupoComplemento\CopiaGrupoComplementoRequest;
use App\Http\Requests\Cardapios\Categorias\Itens\GrupoComplemento\StoreGrupoComplementoRequest;
use App\Models\Cardapio;
use App\Models\Categoria;
use App\Models\Configuracao;
use App\Models\Empresa;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GrupoComplementoController extends Controller
{
    public Empresa $empresa;
    public Cardapio $cardapio;
    public Categoria $categoria;
    public Item $item;
    public bool $exportaDadosIfood;

    public function __construct(Request $request)
    {
        $this->empresa = Empresa::query()->where('cnpj', $request->route('cnpj'))->firstOrFail();
        $this->cardapio = $this->empresa->cardapios()->where('id', $request->route('cardapio_id'))->firstOrFail();
        $this->categoria = Categoria::withTrashed()->where('cardapio_id', $this->cardapio->getAttribute('id'))->where('id', $request->route('categoria_id'))->firstOrFail();
        $this->item = Item::withTrashed()->where('categoria_id', $this->categoria->getAttribute('id'))->where('id', $request->route('item_id'))->firstOrFail();
        /** @var Configuracao|null $configuracaoExportaDadosIfood */
        $configuracaoExportaDadosIfood = $this->empresa->configuracoes()->where('configuracao', 'replicar_informacao_importacao')->first();
        // A exportação só faz sentido pra cardápios que foram efetivamente
        // importados do iFood — um cardápio criado manualmente não existe lá.
        $this->exportaDadosIfood = (bool) $configuracaoExportaDadosIfood?->getAttribute('valor')
            && $this->cardapio->getAttribute('tipo_importacao') === 'ifood';
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGrupoComplementoRequest $request, string $cnpj, string $cardapio_id, string $categoria_id, string $item_id, StoreGrupoComplementoAction $action)
    {
        $dados = $request->validated();
        $action->handle($dados, $this->cardapio, $this->item, $this->exportaDadosIfood);
        return redirect()->back();
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function copiaGrupoComplementos(CopiaGrupoComplementoRequest $request, string $cnpj, string $cardapio_id, string $categoria_id, string $item_id, CopiaGrupoComplementoAction $action) {
        $dados = $request->validated();
        $action->handle($dados, $this->categoria->getAttribute('id'), $this->item->getAttribute('id'), $this->exportaDadosIfood);
        return response()->json(['mensagem' => 'Grupo de complemento copiado com sucesso']);
    }

    public function buscaComplementosParaCopia(Request $request, string $cnpj, string $cardapio_id, string $categoria_id, string $item_id, BuscaComplementosParaCopiaAction $action): JsonResponse
    {
        $complementos = $action->handle($this->cardapio, $request->string('busca')->value() ?: null, (int) $request->input('por_pagina', 5));

        return response()->json(['complementos' => $complementos]);
    }
}
