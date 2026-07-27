<?php

namespace App\Http\Controllers\Empresa\Fidelidade;

use App\Actions\Fidelidade\AtualizaFidelidadeConfigAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Fidelidade\FidelidadeConfigRequest;
use App\Models\Categoria;
use App\Models\Empresa;
use Inertia\Inertia;

class FidelidadeConfigController extends Controller
{
    public Empresa $empresa;

    public function __construct()
    {
        $this->empresa = Empresa::where('cnpj', request('cnpj'))->firstOrFail();
    }

    public function index()
    {
        $config = $this->empresa->fidelidadeConfig;

        $categoriasOptions = Categoria::query()
            ->whereHas('cardapio', fn ($q) => $q->where('empresa_id', $this->empresa->getAttribute('id'))->where('tipo_funcionamento', 'delivery'))
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn (Categoria $categoria) => [
                'value' => $categoria->getAttribute('id'),
                'label' => $categoria->getAttribute('nome'),
            ]);

        return Inertia::render('Empresa/Fidelidade/Configuracao', [
            'fidelidadeConfig' => [
                'ativo' => (bool) ($config?->getAttribute('ativo') ?? false),
                'tipo_gatilho' => $config?->getAttribute('tipo_gatilho'),
                'valor_gatilho' => $config?->getAttribute('valor_gatilho'),
                'tipo_recompensa' => $config?->getAttribute('tipo_recompensa'),
                'valor_recompensa' => $config?->getAttribute('valor_recompensa'),
                'base_calculo_desconto' => $config?->getAttribute('base_calculo_desconto') ?? 'subtotal_itens',
                'valor_max_premio' => $config?->getAttribute('valor_max_premio'),
                'categorias_bloqueadas' => $config?->getAttribute('categorias_bloqueadas') ?? [],
                'validade_dias' => $config?->getAttribute('validade_dias'),
                'tipos_funcionamento' => $config?->tipos_funcionamento_efetivos ?? ['delivery', 'retirada', 'mesa'],
            ],
            'categoriasOptions' => $categoriasOptions,
        ]);
    }

    public function update(FidelidadeConfigRequest $request, AtualizaFidelidadeConfigAction $action)
    {
        $action->handle($this->empresa, $request->validated());

        return response()->json(['mensagem' => 'Programa de fidelidade salvo com sucesso']);
    }
}
