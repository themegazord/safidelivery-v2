<?php

namespace App\Http\Controllers\Empresa\Cardapios\Categorias\Itens\GrupoComplemento;

use App\Actions\GrupoComplementos\CopiaGrupoComplementoAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cardapios\Categorias\Itens\GrupoComplemento\CopiaGrupoComplementoRequest;
use App\Models\Cardapio;
use App\Models\Categoria;
use App\Models\Empresa;
use App\Models\Item;
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
        $this->exportaDadosIfood = $this->empresa->configuracoes()->where('configuracao', 'replicar_informacao_importacao')->firstOrFail()->getAttribute('valor');
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

    public function copiaGrupoComplementos(CopiaGrupoComplementoRequest $request, string $cnpj, string $cardapio_id, string $categoria_id, string $item_id, CopiaGrupoComplementoAction $action) {
        $dados = $request->validated();
        $action->handle($dados, $this->categoria->getAttribute('id'), $this->item->getAttribute('id'), $this->exportaDadosIfood);
        return response()->json(['mensagem' => 'Grupo de complemento copiado com sucesso']);
    }
}
