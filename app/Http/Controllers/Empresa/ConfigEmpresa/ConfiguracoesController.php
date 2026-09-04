<?php

namespace App\Http\Controllers\Empresa\ConfigEmpresa;

use App\Actions\ConfigEmpresa\AtualizaConfiguracoesAction;
use App\Enums\ModoCalculoFrete;
use App\Http\Controllers\Controller;
use App\Http\Requests\ConfigEmpresa\AtualizaConfiguracoesRequest;
use App\Models\Configuracao;
use App\Models\Empresa;
use Inertia\Inertia;

class ConfiguracoesController extends Controller
{
    private const CONFIGURACOES_BOOLEANAS = [
        'aceite_automatico',
        'aceite_automatico_ifood',
        'replicar_informacao_importacao',
        'informa_mesa_comanda',
        'modo_atendente',
        'multiplas_formas_pagamento',
        'whatsapp_notificacao_status_pedido',
    ];

    private const CONFIGURACOES_PADRAO = [
        'aceite_automatico' => false,
        'aceite_automatico_ifood' => false,
        'media_tempo_preparo' => null,
        'modo_calculo_frete' => null,
        'replicar_informacao_importacao' => false,
        'informa_mesa_comanda' => false,
        'modo_atendente' => false,
        'periodo_inatividade_cliente' => null,
        'fora_area_entrega' => 'bloquear',
        'multiplas_formas_pagamento' => false,
        'whatsapp_notificacao_status_pedido' => false,
    ];

    public Empresa $empresa;

    public function __construct()
    {
        $this->empresa = Empresa::where('cnpj', request('cnpj'))->firstOrFail();
    }

    public function index()
    {
        $configuracoes = self::CONFIGURACOES_PADRAO;

        $configs = Configuracao::where('empresa_id', $this->empresa->getAttribute('id'))
            ->whereIn('configuracao', array_keys(self::CONFIGURACOES_PADRAO))
            ->get(['configuracao', 'valor']);

        foreach ($configs as $config) {
            $chave = $config->getAttribute('configuracao');
            $valor = $config->getAttribute('valor');

            $configuracoes[$chave] = in_array($chave, self::CONFIGURACOES_BOOLEANAS, true)
                ? (bool) $valor
                : $valor;
        }

        return Inertia::render('Empresa/SuaLoja/Configuracoes', [
            'configuracoes' => $configuracoes,
            'modoCalculoOptions' => collect(ModoCalculoFrete::cases())->map(fn (ModoCalculoFrete $caso) => [
                'value' => $caso->value,
                'label' => $caso->descricao(),
            ])->values(),
        ]);
    }

    public function update(AtualizaConfiguracoesRequest $request, AtualizaConfiguracoesAction $action)
    {
        $action->handle($this->empresa, $request->validated());

        return response()->json(['mensagem' => 'Configuração salva com sucesso']);
    }
}
