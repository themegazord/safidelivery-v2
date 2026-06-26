<?php

namespace App\Http\Controllers\Empresa\CardapioDigital;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Services\Empresa\CardapioDigital\CardapioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class CardapioController extends Controller
{
    public Empresa $empresa;
    public function __construct(public readonly CardapioService $cardapioService) {}

    public function index(string $interacao_id, string $tipo_funcionamento)
    {
        $this->empresa = Empresa::query()->where('interacao_id', $interacao_id)->first();

        if (request()->query('mesa') !== null) {
            Session::put('mesaQuery', request()->query('mesa'));
        }
        if (request()->query('cupom') !== null) {
            Session::put('cupomQuery', request()->query('cupom'));
        }
        Session::put('tipo_funcionamento', $tipo_funcionamento);
        Session::put('interacao_id', $interacao_id);
        Session::put('nome_fantasia', $this->empresa->getAttribute('nome_fantasia'));
        Session::put('configuracoes', $this->empresa->configuracoes()
            ->whereIn('configuracao', ['informa_mesa_comanda', 'modo_atendente'])
            ->pluck('valor', 'configuracao')
            ->toArray());
        Session::put('loja_aberta', $this->cardapioService->validaRecebePedidos($tipo_funcionamento, $this->empresa->getAttribute('id')));

        return Inertia::render('Empresa/CardapioDigital/Cardapio', [
            'interacao_id' => $interacao_id,
            'tipo_funcionamento' => $tipo_funcionamento,
            'capa' => $this->empresa->getAttribute('capa'),
            'logo' => $this->empresa->getAttribute('logo'),
            'nome_fantasia' => $this->empresa->getAttribute('nome_fantasia'),
            'categorias' => $this->cardapioService->categoriasDisponiveis($this->empresa, $tipo_funcionamento),
            'cardapioHoje' => $this->cardapioService->cardapioHoje(),
            'lojaAberta' => $this->cardapioService->validaRecebePedidos($tipo_funcionamento, $this->empresa->getAttribute('id')),
            'configuracoes' => $this->empresa->configuracoes()
                ->whereIn('configuracao', ['informa_mesa_comanda', 'modo_atendente'])
                ->pluck('valor', 'configuracao')
                ->toArray()
        ]);
    }

    public function itemPedido(Request $request)
    {
        return response()->json($this->cardapioService->getItemPedido($request->input('id')));
    }

    public function itemPizzaPedido(Request $request)
    {
        return response()->json($this->cardapioService->getItemPizzaPedido($request->input('tamanho_id'), $request->input('qtdeSabor'), $request->input('menorValorTamanho')));
    }

    public function itemComboPedido(Request $request)
    {
        return response()->json($this->cardapioService->setItemComboPedido($request->input('combo_id')));
    }
}
