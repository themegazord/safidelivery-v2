<?php

namespace App\Http\Controllers\Empresa\Cardapios\Categorias\Itens;

use App\Actions\Itens\CloneItemAction;
use App\Actions\Itens\ShowItemAction;
use App\Actions\Itens\DestroyImagemItemAction;
use App\Actions\Itens\DestroyItemAction;
use App\Actions\Itens\StoreImagemItemAction;
use App\Actions\Itens\StoreItemAction;
use App\Actions\Itens\ToggleStatusItemAction;
use App\Actions\Itens\UpdateItemAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cardapios\Categorias\Itens\DestroyImagemItemRequest;
use App\Http\Requests\Cardapios\Categorias\Itens\StoreImagemItemRequest;
use App\Http\Requests\Cardapios\Categorias\Itens\StoreItemRequest;
use App\Http\Requests\Cardapios\Categorias\Itens\UpdateItemRequest;
use App\Http\Resources\ItemResource;
use App\Models\Cardapio;
use App\Models\Categoria;
use App\Models\Empresa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public Empresa $empresa;
    public Cardapio $cardapio;
    public Categoria $categoria;
    public bool $exportaDadosIfood;


    public function __construct(Request $request)
    {
        $this->empresa = Empresa::query()->where('cnpj', $request->route('cnpj'))->firstOrFail();
        $this->cardapio = $this->empresa->cardapios()->where('id', $request->route('cardapio_id'))->firstOrFail();
        $this->categoria = Categoria::query()->where('cardapio_id', $this->cardapio->getAttribute('id'))->where('id', $request->route('categoria_id'))->firstOrFail();
        $this->exportaDadosIfood = $this->empresa->configuracoes()->where('configuracao', 'replicar_informacao_importacao')->firstOrFail()->getAttribute('valor');
        if (!$this->cardapio) {
            abort(404);
        }
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
    public function store(StoreItemRequest $request, string $cnpj, string $cardapio_id, string $categoria_id, StoreItemAction $action): RedirectResponse
    {
        $dados = $request->validated();
        $action->handle($dados, $this->cardapio->getAttribute('id'), $this->categoria, $this->exportaDadosIfood, $this->empresa);
        return redirect()->back();
    }

    public function storeImage(StoreImagemItemRequest $request, string $cnpj, string $cardapio_id, string $categoria_id, StoreImagemItemAction $action): JsonResponse
    {
        $request->validated(); // só dispara a validação, sem precisar guardar o retorno
        $imagem = $request->file('imagem');
        $url = $action->handle($imagem);
        return response()->json(['url' => $url]);
    }

    public function destroyImage(DestroyImagemItemRequest $request, string $cnpj, string $cardapio_id, string $categoria_id, DestroyImagemItemAction $action): JsonResponse
    {
        $action->handle($request->validated('url'));
        return response()->json(['message' => 'Imagem removida com sucesso.']);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $cnpj, string $cardapio_id, string $categoria_id, string $item_id, ShowItemAction $action): JsonResponse
    {
        $item = $action->handle($this->categoria->getAttribute('id'), $item_id);
        return response()->json(['item' => new ItemResource($item)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateItemRequest $request, string $cnpj, string $cardapio_id, string $categoria_id, string $item_id, UpdateItemAction $action): JsonResponse
    {
        $dados = $request->validated();
        $action->handle($dados, $this->cardapio->getAttribute('id'), $this->categoria, $this->exportaDadosIfood, $this->empresa, $item_id);
        return response()->json(['mensagem' => 'Item editado com sucesso']);
    }

    public function clone(string $cnpj, string $cardapio_id, string $categoria_id, string $item_id, CloneItemAction $action) {
        $action->handle($item_id, $this->exportaDadosIfood, $this->empresa, $this->categoria);
        return response()->json(['mensagem' => 'Item clonado com sucesso']);
    }

    public function status(string $cnpj, string $cardapio_id, string $categoria_id, string $item_id, ToggleStatusItemAction $action) {
        $status = $action->handle($item_id, $this->categoria->getAttribute('id'), $this->exportaDadosIfood, $this->empresa);
        return response()->json(['mensagem' => 'Item ' . ($status ? 'inativado' : 'ativado') . ' com sucesso']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $cnpj, string $cardapio_id, string $categoria_id, string $item_id, DestroyItemAction $action)
    {
        $action->handle($item_id, $this->categoria->getAttribute('id'));
        return response()->json(['mensagem' => 'Item removido com sucesso']);
    }
}
