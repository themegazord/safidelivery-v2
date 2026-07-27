<?php

namespace App\Http\Controllers\Empresa\CardapioDigital;

use App\Actions\FinalizarPedido\AlteraEnderecoPrincipalAction;
use App\Actions\FinalizarPedido\CadastraEnderecoNovoAction;
use App\Actions\FinalizarPedido\CalculaRotaEntregaAction;
use App\Actions\FinalizarPedido\FinalizarPedidoAction;
use App\Actions\FinalizarPedido\ListaCuponsVisiveisAction;
use App\Actions\FinalizarPedido\ValidaCupomPedidoAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Endereco\CadastroEnderecoRequest;
use App\Http\Requests\FinalizarPedido\FinalizarPedidoRequest;
use App\Http\Requests\FinalizarPedido\ValidacaoCupomRequest;
use App\Models\Empresa;
use App\Models\FormaPagamento;
use App\Services\Google\GoogleMapService;
use App\Traits\ResolveComandaAtual;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FinalizarPedidoController extends Controller
{
    use ResolveComandaAtual;

    public array $dadosDistanciaRota = [];
    public ?Empresa $empresa;

    public function index(Request $request)
    {
        $usuario = null;
        $mesa = null;
        $cupomDesconto = null;
        $enderecoFormatadoEmpresa = null;
        $formasPagamentos = null;
        $cuponsVisiveis = [];

        if (!session('interacao_id')) {
            return to_route('aplicacao.home');
        }

        $this->empresa = Empresa::query()->where('interacao_id', session('interacao_id'))->with(['taxas_entrega', 'configuracoes', 'promocoes', 'cashbackConfig', 'fidelidadeConfig', 'integracoes'])->first();
        $temIntegracaoPagarme = $this->empresa->integracoes()->where('tipo', 'pagarme')->whereNotNull('chavesecreta_pagarme')->exists();
        $configuracoes = $this->empresa->configuracoes
            ->whereIn('configuracao', ['informa_mesa_comanda', 'modo_atendente', 'multiplas_formas_pagamento', 'taxa_fixa', 'valor_minimo_pedido', 'frete_gratis_acima', 'prioridade_zona_sobreposicao'])
            ->pluck('valor', 'configuracao')
            ->toArray();
        $multiplasFormasPagamento = boolval($configuracoes['multiplas_formas_pagamento'] ?? false);
        $tipo_funcionamento = session('tipo_funcionamento');
        $tipo_funcionamento_pedido = $tipo_funcionamento === 'delivery' ? 'D' : 'M';
        $tipoPermiteFidelidade = \in_array($tipo_funcionamento, $this->empresa->fidelidadeConfig?->tipos_funcionamento_efetivos ?? ['delivery', 'retirada', 'mesa']);

        $ehModoAtendenteEmMesa = $tipo_funcionamento === 'mesa' && (boolval($configuracoes['modo_atendente'] ?? false));

        if (! $ehModoAtendenteEmMesa) {
            $usuario = Auth::user();
        }

        $interacao_id = session('interacao_id');

        $telefoneParaComanda = null;

        if ($ehModoAtendenteEmMesa) {
            $telefoneParaComanda = session('telefone_cliente_modoatendente');
        } else if (Auth::check() && Auth::user()->cliente) {
            $telefoneParaComanda = Auth::user()->cliente->telefone;
        }

        $this->resolveComandaAtual($telefoneParaComanda, $this->empresa->getAttribute('id'), $configuracoes);

        if (session('mesaQuery') !== null) {
            $mesa = session('mesaQuery');
        }
        if (session('cupomQuery') !== null) {
            $cupomDesconto = session('cupomQuery');
        }

        if ($tipo_funcionamento !== 'mesa') {
            $enderecoFormatadoEmpresa = $this->empresa->endereco->enderecoSemComplementoFormatado();

            $formasPagamentos = FormaPagamento::whereEmpresaId($this->empresa->id)
                ->where('interno', false)
                ->orderBy('tipo')
                ->orderBy('descricao')
                ->get()
                ->map(fn ($f) => ['value' => $f->id, 'label' => $f->descricao, 'tipo' => $f->tipo])
                ->values()
                ->all();

            $cuponsVisiveis = (new ListaCuponsVisiveisAction())->handle($this->empresa);
        }

        return Inertia::render('Empresa/CardapioDigital/FinalizarPedido', [
            'interacao_id' => $interacao_id,
            'tipo_funcionamento' => $tipo_funcionamento,
            'nome_fantasia' => $this->empresa->getAttribute('nome_fantasia'),
            'configuracoes' => $configuracoes,
            'lojaAberta' => session('loja_aberta'),
            'mesa' => $mesa,
            'cupomDesconto' => $cupomDesconto,
            'cuponsVisiveis' => $cuponsVisiveis,
            'enderecoFormatadoEmpresa' => $enderecoFormatadoEmpresa,
            'formasPagamentos' => $formasPagamentos,
            'nome' => $ehModoAtendenteEmMesa ? session('nome_cliente_modoatendente') : null,
            'telefone' => $ehModoAtendenteEmMesa ? session('telefone_cliente_modoatendente') : null,
        ]);
    }

    public function consultaDadosRota(Request $request): JsonResponse
    {
        $action = new CalculaRotaEntregaAction();

        $dados = $action->handle(
            enderecoFormatadoEmpresa: $request->input('enderecoFormatadoEmpresa'),
            interacao_id: $request->input('interacao_id'),
            configuracoes: $request->input('configuracoes'),
            subtotalPedido: $request->input('subtotal', 0.0),
        );

        return response()->json($dados);
    }

    public function alteraEnderecoPrincipal(Request $request): JsonResponse {
        $action = new AlteraEnderecoPrincipalAction();

        $action->handle($request->input('cliente_id'), $request->input('novo_endereco_principal_id'));

        return response()->json(['mensagem' => "Endereço principal alterado com sucesso."]);
    }

    public function cadastraNovoEndereco(CadastroEnderecoRequest $request): JsonResponse {
        $enderecoValidado = $request->validated();

        $action = new CadastraEnderecoNovoAction();

        $enderecoCadastrado = $action->handle($enderecoValidado);

        return response()->json([
            'mensagem' => 'Endereço cadastrado com sucesso.',
            'endereco' => $enderecoCadastrado,
        ], Response::HTTP_CREATED);
    }

    public function validaCupomPedido(ValidacaoCupomRequest $request): JsonResponse {
        $dadosValidados = $request->validated();

        $action = new ValidaCupomPedidoAction();

        $empresa = Empresa::query()->where('interacao_id', $dadosValidados['interacao_id'])->firstOrFail();

        try {
            $cupom = $action->handle(
                $dadosValidados['cupom'],
                $empresa->getAttribute('id'),
                $dadosValidados['subtotal'],
                $dadosValidados['frete'] ?? null,
            );
        } catch (\Exception $e) {
            return response()->json(['mensagem' => $e->getMessage()], $e->getCode() ?: JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json(['cupom' => $cupom]);
    }

    public function store(FinalizarPedidoRequest $request): JsonResponse
    {
        $dados = $request->validated();

        $empresa = Empresa::query()
            ->where('interacao_id', $dados['interacao_id'])
            ->firstOrFail();

        try {
            $pedidoCadastrado = (new FinalizarPedidoAction())->handle(
                pedido: $request->input('pedido', []),
                forma_pagamento: $dados['forma_pagamento'] ?? null,
                frete: $dados['frete'] ?? null,
                subtotal: floatval($dados['subtotal']),
                total: floatval($dados['total']),
                observacao: $dados['observacao'] ?? null,
                cliente: $dados['cliente'] ?? null,
                cupom: $dados['cupom'] ?? null,
                tipo_funcionamento: $dados['tipo_funcionamento'],
                empresa_id: $empresa->id,
                configuracoes: $dados['configuracoes'],
                mesa: isset($dados['mesa']) ? intval($dados['mesa']) : null,
                comanda: session('comanda_atual')
            );

            return response()->json([
                'pedido_id' => $pedidoCadastrado->id,
                'mensagem'  => 'Pedido realizado com sucesso!',
            ]);
        } catch (\Exception $e) {
            return response()->json(['mensagem' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
