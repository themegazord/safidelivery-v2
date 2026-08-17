<?php

namespace App\Http\Controllers\Empresa\Cardapios\Categorias\Itens;

use App\Actions\GrupoComplementos\BuscaGruposComplementoParaCopiaAction;
use App\Actions\Itens\BuscaItensParaComboAction;
use App\Actions\Itens\ShowComboAction;
use App\Actions\Itens\StoreComboAction;
use App\Actions\Itens\UpdateComboAction;
use App\Actions\Itens\UpdateComboCodPdvAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cardapios\Categorias\Itens\StoreComboRequest;
use App\Http\Requests\Cardapios\Categorias\Itens\UpdateComboCodPdvRequest;
use App\Http\Requests\Cardapios\Categorias\Itens\UpdateComboRequest;
use App\Http\Resources\ComboResource;
use App\Models\Cardapio;
use App\Models\Categoria;
use App\Models\Empresa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ComboController extends Controller
{
    public Empresa $empresa;

    public Cardapio $cardapio;

    public Categoria $categoria;

    public function __construct(Request $request)
    {
        $this->empresa = Empresa::query()->where('cnpj', $request->route('cnpj'))->firstOrFail();
        $this->cardapio = $this->empresa->cardapios()->where('id', $request->route('cardapio_id'))->firstOrFail();
        $this->categoria = Categoria::query()->where('cardapio_id', $this->cardapio->getAttribute('id'))->where('id', $request->route('categoria_id'))->firstOrFail();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreComboRequest $request, string $cnpj, string $cardapio_id, string $categoria_id, StoreComboAction $action): RedirectResponse
    {
        $dados = $request->validated();
        $action->handle($dados, $this->cardapio, $this->categoria);

        return redirect()->back();
    }

    /**
     * Display the specified resource.
     */
    public function show(string $cnpj, string $cardapio_id, string $categoria_id, string $combo_id, ShowComboAction $action): JsonResponse
    {
        $combo = $action->handle($this->categoria->getAttribute('id'), (int) $combo_id);

        return response()->json(['combo' => new ComboResource($combo)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateComboRequest $request, string $cnpj, string $cardapio_id, string $categoria_id, string $combo_id, UpdateComboAction $action): JsonResponse
    {
        $dados = $request->validated();
        $action->handle($dados, $this->cardapio, $this->categoria->getAttribute('id'), (int) $combo_id);

        return response()->json(['mensagem' => 'Combo editado com sucesso']);
    }

    public function updateCodPdv(UpdateComboCodPdvRequest $request, string $cnpj, string $cardapio_id, string $categoria_id, string $combo_id, UpdateComboCodPdvAction $action): JsonResponse
    {
        $action->handle($request->validated('external_id'), (int) $combo_id, $this->categoria->getAttribute('id'), $this->cardapio->getAttribute('id'));

        return response()->json(['mensagem' => 'Código PDV atualizado com sucesso']);
    }

    public function buscaItensParaCombo(Request $request, string $cnpj, string $cardapio_id, string $categoria_id, BuscaItensParaComboAction $action): JsonResponse
    {
        $itens = $action->handle($this->cardapio, $request->string('busca')->value() ?: null, (int) $request->input('por_pagina', 5));

        return response()->json(['itens' => $itens]);
    }

    public function buscaGruposComplementoParaCombo(Request $request, string $cnpj, string $cardapio_id, string $categoria_id, BuscaGruposComplementoParaCopiaAction $action): JsonResponse
    {
        $grupos = $action->handle($this->cardapio, $request->string('busca')->value() ?: null, (int) $request->input('por_pagina', 5));

        return response()->json(['grupos' => $grupos]);
    }
}
