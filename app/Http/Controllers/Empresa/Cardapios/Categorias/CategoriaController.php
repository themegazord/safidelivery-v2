<?php

namespace App\Http\Controllers\Empresa\Cardapios\Categorias;

use App\Actions\Categorias\IndexCategoriaAction;
use App\Actions\Itens\IndexItemPorCategoriaAction;
use App\Http\Controllers\Controller;
use App\Models\Cardapio;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class CategoriaController extends Controller
{
    public Empresa $empresa;
    public Cardapio $cardapio;
    public bool $exportaDadosIfood;
    

    public function __construct(Request $request)
    {
        $this->empresa = Empresa::query()->where('cnpj', $request->route('cnpj'))->firstOrFail();
        $this->cardapio = $this->empresa->cardapios->where('id', $request->route('cardapio_id'))->first();
        $this->exportaDadosIfood = $this->empresa->configuracoes->where('configuracao', 'replicar_informacao_importacao')->first()->getAttribute('valor');
        if (!$this->cardapio) {
            abort(404);
        }
    }
    /**
     * Display a listing of the resource.
     */
    public function index(string $cnpj, string $cardapio_id, IndexCategoriaAction $action)
    {
        $categorias = $action->handle($this->cardapio);
        $categoriaStatus = $action->carregaCategoriaStatus($categorias);
        return Inertia::render('Empresa/Cardapios/Categorias/Categoria', [
            'categorias' => $categorias,
            'categoriaStatus' => $categoriaStatus,
            'cardapio_id' => $cardapio_id,
        ]);
    }

    public function itensPorCategoria(string $cnpj, string $cardapio_id, string $categoria_id, IndexItemPorCategoriaAction $action): Collection {
        return $action->handle($this->cardapio, $categoria_id);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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
