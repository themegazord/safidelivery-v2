<?php

namespace App\Http\Controllers\Empresa\Cashback;

use App\Actions\Cashback\AtualizaCashbackConfigAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cashback\CashbackConfigRequest;
use App\Models\Empresa;
use Inertia\Inertia;

class CashbackConfigController extends Controller
{
    public Empresa $empresa;

    public function __construct()
    {
        $this->empresa = Empresa::where('cnpj', request('cnpj'))->firstOrFail();
    }

    public function index()
    {
        $config = $this->empresa->cashbackConfig;

        return Inertia::render('Empresa/Cashback/Configuracao', [
            'cashbackConfig' => [
                'status' => (bool) ($config?->getAttribute('status') ?? false),
                'cashback_tipo' => $config?->cashback_tipo?->value,
                'cashback_porcentagem' => $config?->getAttribute('cashback_porcentagem'),
                'base_calculo_porcentagem' => $config?->getAttribute('base_calculo_porcentagem') ?? 'subtotal',
                'cashback_fixo' => $config?->getAttribute('cashback_fixo'),
                'dias_validade' => $config?->getAttribute('dias_validade'),
                'tipos_funcionamento' => $config?->tipos_funcionamento_efetivos ?? ['delivery', 'retirada', 'mesa'],
            ],
        ]);
    }

    public function update(CashbackConfigRequest $request, AtualizaCashbackConfigAction $action)
    {
        $action->handle($this->empresa, $request->validated());

        return response()->json(['mensagem' => 'Configuração de cashback salva com sucesso']);
    }
}
