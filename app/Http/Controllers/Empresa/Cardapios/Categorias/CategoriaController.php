<?php

namespace App\Http\Controllers\Empresa\Cardapios\Categorias;

use App\Actions\Categorias\IndexCategoriaAction;
use App\Actions\Categorias\ReordenarCategoriaAction;
use App\Actions\Categorias\StoreCategoriaAction;
use App\Actions\Itens\IndexItemPorCategoriaAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cardapios\Categorias\ReordenarCategoriaRequest;
use App\Http\Requests\Cardapios\Categorias\StoreCategoriaRequest;
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

    public function reordenar(ReordenarCategoriaRequest $request, string $cnpj, string $cardapio_id, ReordenarCategoriaAction $action) {
        $ordem = $request->validated()['ordem'];
        $action->handle($ordem);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoriaRequest $request, string $cnpj, string $cardapio_id, StoreCategoriaAction $action)
    {
        $dados = $request->validated();
        $action->handle($dados, $this->cardapio, $this->exportaDadosIfood, $this->empresa);
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
}
