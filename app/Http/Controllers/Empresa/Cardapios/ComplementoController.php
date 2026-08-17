<?php

namespace App\Http\Controllers\Empresa\Cardapios;

use App\Actions\GrupoComplementos\IndexGruposComplementoCardapioAction;
use App\Http\Controllers\Controller;
use App\Models\Cardapio;
use App\Models\Empresa;
use App\Models\GrupoComplemento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplementoController extends Controller
{
    public Empresa $empresa;

    public Cardapio $cardapio;

    public function __construct(Request $request)
    {
        $this->empresa = Empresa::query()->where('cnpj', $request->route('cnpj'))->firstOrFail();
        $this->cardapio = $this->empresa->cardapios()->where('id', $request->route('cardapio_id'))->firstOrFail();
    }

    public function index(Request $request, IndexGruposComplementoCardapioAction $action): JsonResponse
    {
        $grupos = $action->handle($this->cardapio, $request->only(['nome', 'por_pagina', 'page']));

        $grupos->through(fn (GrupoComplemento $grupo) => [
            'id' => $grupo->getAttribute('id'),
            'nome' => $grupo->getAttribute('nome'),
            'obrigatoriedade' => (bool) $grupo->getAttribute('obrigatoriedade'),
            'qtd_minima' => $grupo->getAttribute('qtd_minima'),
            'qtd_maxima' => $grupo->getAttribute('qtd_maxima'),
            'trashed' => $grupo->trashed(),
            'item_id' => $grupo->getAttribute('item_id'),
            'item_nome' => $grupo->item?->getAttribute('nome'),
            'categoria_id' => $grupo->item?->getAttribute('categoria_id'),
        ]);

        return response()->json($grupos);
    }
}
