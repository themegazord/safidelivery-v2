<?php

namespace App\Http\Controllers\Empresa\Cardapios;

use App\Actions\Itens\IndexProdutosCardapioAction;
use App\Http\Controllers\Controller;
use App\Models\Cardapio;
use App\Models\Empresa;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProdutoController extends Controller
{
    public Empresa $empresa;

    public Cardapio $cardapio;

    public function __construct(Request $request)
    {
        $this->empresa = Empresa::query()->where('cnpj', $request->route('cnpj'))->firstOrFail();
        $this->cardapio = $this->empresa->cardapios()->where('id', $request->route('cardapio_id'))->firstOrFail();
    }

    public function index(Request $request, IndexProdutosCardapioAction $action): JsonResponse
    {
        $produtos = $action->handle($this->cardapio, $request->only(['status', 'nome', 'ordenacao', 'por_pagina', 'page']));

        $produtos->through(fn (Item $item) => [
            'id' => $item->getAttribute('id'),
            'nome' => $item->getAttribute('nome'),
            'tipo' => $item->getAttribute('tipo'),
            'trashed' => $item->trashed(),
            'categoria_id' => $item->getAttribute('categoria_id'),
            'categoria_nome' => $item->categoria?->getAttribute('nome'),
        ]);

        return response()->json($produtos);
    }
}
