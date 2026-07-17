<?php

namespace App\Http\Controllers\Empresa\CardapioDigital;

use App\Actions\FinalizarPedido\CalculaRotaEntregaAction;
use App\Actions\FinalizarPedido\AlteraEnderecoPrincipalAction;
use App\Actions\FinalizarPedido\CadastraEnderecoNovoAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Endereco\CadastroEnderecoRequest;
use App\Models\Empresa;
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

    public function index()
    {
        $usuario = null;
        $mesa = null;
        $cupomDesconto = null;
        $enderecoFormatadoEmpresa = null;
        $formasPagamentos = null;

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
        }

        return Inertia::render('Empresa/CardapioDigital/FinalizarPedido', [
            'interacao_id' => $interacao_id,
            'tipo_funcionamento' => $tipo_funcionamento,
            'nome_fantasia' => $this->empresa->getAttribute('nome_fantasia'),
            'configuracoes' => $configuracoes,
            'lojaAberta' => session('loja_aberta'),
            'mesa' => $mesa,
            'cupomDesconto' => $cupomDesconto,
            'enderecoFormatadoEmpresa' => $enderecoFormatadoEmpresa
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
}
