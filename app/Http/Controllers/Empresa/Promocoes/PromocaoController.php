<?php

namespace App\Http\Controllers\Empresa\Promocoes;

use App\Actions\Promocoes\AtualizaPromocaoAction;
use App\Actions\Promocoes\CadastraPromocaoAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Promocoes\PromocaoRequest;
use App\Models\Empresa;
use App\Models\Promocao;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;

class PromocaoController extends Controller
{
    public Empresa $empresa;

    public function __construct()
    {
        $this->empresa = Empresa::where('cnpj', request('cnpj'))->firstOrFail();
    }

    public function index(Request $request)
    {
        $filtros = $request->only(['tipo_cupom', 'onde_afetara', 'validade', 'nome_cupom', 'status']);

        $cupons = $this->empresa->promocoes()->withCount('pedidosQueForamUsadosCupom');

        if (! empty($filtros['tipo_cupom'])) {
            $cupons->where('tipo_cupom', $filtros['tipo_cupom']);
        }

        if (! empty($filtros['onde_afetara'])) {
            $cupons->where('onde_afetara', $filtros['onde_afetara']);
        }

        if (! empty($filtros['validade'])) {
            $cupons->where('data_vencimento', $filtros['validade'], now()->toDateString());
        }

        if (! empty($filtros['nome_cupom'])) {
            $cupons->where('nome_cupom', 'like', '%'.$filtros['nome_cupom'].'%');
        }

        if (isset($filtros['status']) && $filtros['status'] !== '') {
            $cupons->where('status', (bool) $filtros['status']);
        }

        $porPagina = (int) $request->input('por_pagina', 10);

        $cuponsPaginados = $cupons->orderBy('nome_cupom')->paginate($porPagina)->withQueryString();

        $cuponsPaginados->through(fn (Promocao $cupom) => [
            'id' => $cupom->getAttribute('id'),
            'empresa_id' => $cupom->getAttribute('empresa_id'),
            'nome_cupom' => $cupom->getAttribute('nome_cupom'),
            'descricao_cupom' => $cupom->getAttribute('descricao_cupom'),
            'valido_cliente_novo' => (bool) $cupom->getAttribute('valido_cliente_novo'),
            'onde_afetara' => $cupom->getAttribute('onde_afetara'),
            'tipo_cupom' => $cupom->getAttribute('tipo_cupom'),
            'valor_desconto' => (float) $cupom->getAttribute('valor_desconto'),
            'valor_minimo_pedido' => (float) $cupom->getAttribute('valor_minimo_pedido'),
            'valor_maximo_desconto' => (float) $cupom->getAttribute('valor_maximo_desconto'),
            'qtde_clientes_usabilidade' => $cupom->getAttribute('qtde_clientes_usabilidade'),
            'qtde_clientes' => (int) $cupom->getAttribute('qtde_clientes'),
            'qtde_usos' => (int) $cupom->getAttribute('qtde_usos'),
            'uso_unico' => (bool) $cupom->getAttribute('uso_unico'),
            'data_vencimento' => $cupom->getAttribute('data_vencimento'),
            'dias_disponiveis' => $cupom->getAttribute('dias_disponiveis'),
            'cupom_visivel' => (bool) $cupom->getAttribute('cupom_visivel'),
            'status' => (bool) $cupom->getAttribute('status'),
            'pedidos_que_foram_usados_cupom_count' => $cupom->getAttribute('pedidos_que_foram_usados_cupom_count'),
            'created_at' => $cupom->getAttribute('created_at'),
            'deleted_at' => $cupom->getAttribute('deleted_at'),
        ]);

        return Inertia::render('Empresa/Promocoes/ListagemPromocoes', [
            'cupons' => $cuponsPaginados,
            'filtros' => $filtros,
            'estatisticas' => [
                'total' => $this->empresa->promocoes()->count(),
                'ativos' => $this->empresa->promocoes()->where('status', true)->count(),
                'expirados' => $this->empresa->promocoes()->where('data_vencimento', '<', now()->toDateString())->count(),
                'total_usos' => $this->empresa->promocoes()->withCount('pedidosQueForamUsadosCupom')->get()->sum('pedidos_que_foram_usados_cupom_count'),
            ],
            'interacaoId' => $this->empresa->getAttribute('interacao_id'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Empresa/Promocoes/CadastroPromocao');
    }

    public function store(PromocaoRequest $request, CadastraPromocaoAction $action)
    {
        $dados = $request->validated();
        $status = Arr::pull($dados, 'status');

        $action->handle($this->empresa, $dados, $status);

        return response()->json(['mensagem' => 'Cupom cadastrado com sucesso']);
    }

    public function edit(string $cnpj, string $cupom_id)
    {
        $promocao = Promocao::withTrashed()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->findOrFail(base64_decode($cupom_id));

        return Inertia::render('Empresa/Promocoes/EdicaoPromocao', [
            'cupomId' => $cupom_id,
            'promocao' => [
                'nome_cupom' => $promocao->getAttribute('nome_cupom'),
                'descricao_cupom' => $promocao->getAttribute('descricao_cupom'),
                'valido_cliente_novo' => (bool) $promocao->getAttribute('valido_cliente_novo'),
                'onde_afetara' => $promocao->getAttribute('onde_afetara'),
                'tipo_cupom' => $promocao->getAttribute('tipo_cupom'),
                'valor_desconto' => (float) $promocao->getAttribute('valor_desconto'),
                'valor_minimo_pedido' => (float) $promocao->getAttribute('valor_minimo_pedido'),
                'valor_maximo_desconto' => (float) $promocao->getAttribute('valor_maximo_desconto'),
                'qtde_clientes_usabilidade' => $promocao->getAttribute('qtde_clientes_usabilidade'),
                'qtde_clientes' => (int) $promocao->getAttribute('qtde_clientes'),
                'qtde_usos' => (int) $promocao->getAttribute('qtde_usos'),
                'uso_unico' => (bool) $promocao->getAttribute('uso_unico'),
                'data_vencimento' => $promocao->getAttribute('data_vencimento'),
                'dias_disponiveis' => json_decode($promocao->getAttribute('dias_disponiveis')),
                'cupom_visivel' => (bool) $promocao->getAttribute('cupom_visivel'),
                'status' => $promocao->trashed() ? 'inativo' : 'ativo',
            ],
        ]);
    }

    public function update(PromocaoRequest $request, AtualizaPromocaoAction $action, string $cnpj, string $cupom_id)
    {
        $promocao = Promocao::withTrashed()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->findOrFail(base64_decode($cupom_id));

        $dados = $request->validated();
        $status = Arr::pull($dados, 'status');

        $action->handle($promocao, $dados, $status);

        return response()->json(['mensagem' => 'Cupom editado com sucesso']);
    }

    public function destroy(string $cnpj, string $cupom_id)
    {
        $promocao = $this->empresa->promocoes()->findOrFail(base64_decode($cupom_id));
        $promocao->delete();

        return response()->json(['mensagem' => 'Cupom removido com sucesso']);
    }
}
