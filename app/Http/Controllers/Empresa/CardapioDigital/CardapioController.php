<?php

namespace App\Http\Controllers\Empresa\CardapioDigital;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Services\Empresa\CardapioDigital\CardapioService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CardapioController extends Controller
{
    public Empresa $empresa;
    public function __construct(public readonly CardapioService $cardapioService) {}

    public function index(string $interacao_id, string $tipo_funcionamento) {
        $this->empresa = Empresa::query()->where('interacao_id', $interacao_id)->first();

        return Inertia::render('Empresa/CardapioDigital/Cardapio', [
            'interacao_id' => $interacao_id,
            'tipo_funcionamento' => $tipo_funcionamento,
            'capa' => $this->empresa->getAttribute('capa'),
            'logo' => $this->empresa->getAttribute('logo'),
            'nome_fantasia' => $this->empresa->getAttribute('nome_fantasia'),
            'categorias' => $this->cardapioService->categoriasDisponiveis($this->empresa, $tipo_funcionamento),
            'cardapioHoje' => $this->cardapioService->cardapioHoje()
        ]);
    }

    public function itemPedido(Request $request) {
        return response()->json($this->cardapioService->getItemPedido($request->input('id')));
    }

    public function itemPizzaPedido(Request $request) {
        return response()->json($this->cardapioService->getItemPizzaPedido($request->input('tamanho_id'), $request->input('qtdeSabor'), $request->input('menorValorTamanho')));
    }

    public function itemComboPedido(Request $request) {
        return response()->json($this->cardapioService->setItemComboPedido($request->input('combo_id')));
    }
}
