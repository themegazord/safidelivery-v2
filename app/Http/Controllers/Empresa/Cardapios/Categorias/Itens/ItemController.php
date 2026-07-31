<?php

namespace App\Http\Controllers\Empresa\Cardapios\Categorias\Itens;

use App\Actions\Itens\StoreImagemItemAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cardapios\Categorias\Itens\StoreImagemItemRequest;
use Illuminate\Http\Request;

class ItemController extends Controller
{
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
    public function store(Request $request)
    {
        //
    }

    public function storeImage(StoreImagemItemRequest $request, string $cnpj, string $cardapio_id, StoreImagemItemAction $action)
    {
        $request->validated(); // só dispara a validação, sem precisar guardar o retorno
        $imagem = $request->file('imagem');
        $url = $action->handle($imagem);
        return response()->json(['url' => $url]);
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
}
