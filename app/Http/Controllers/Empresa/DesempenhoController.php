<?php

namespace App\Http\Controllers\Empresa;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Services\Empresa\DesempenhoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DesempenhoController extends Controller
{
    public Empresa $empresa;
    public function __construct(public readonly DesempenhoService $desempenhoService)
    {
        $this->empresa = Empresa::where('cnpj', request('cnpj'))->firstOrFail();
    }
    public function index()
    {
        return Inertia::render('Empresa/Desempenho', [
            'necessidadesConfiguracao' => $this->desempenhoService->verificaNecessidadesConfiguracao($this->empresa->getAttribute('id'), $this->empresa->getAttribute('cnpj')),
            'temTokenIfood' => $this->empresa->getAttribute('tokenIfood') !== null,
            'estaRecebendoIfood' => (bool) $this->empresa->getAttribute('esta_recebendo_pedidos_ifood'),
            'linkDelivery' => config('app.url') . '/loja/' . $this->empresa->getAttribute('interacao_id') . '/delivery',
            'linkMesa' => config('app.url') . '/loja/' . $this->empresa->getAttribute('interacao_id') . '/mesa'
        ]);
    }

    public function buscaPedidosPorData(Request $request) {
        $dados = $request->only(['dias']);
        $this->desempenhoService->empresa = $this->empresa;
        $resposta = $this->desempenhoService->atualizaDados($dados['dias']);
        return response()->json($resposta);
    }
}
