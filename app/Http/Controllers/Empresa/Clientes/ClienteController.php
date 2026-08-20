<?php

namespace App\Http\Controllers\Empresa\Clientes;

use App\Actions\Clientes\ConsultaDadosPainelCashbackAction;
use App\Actions\Clientes\DetalheClienteAction;
use App\Actions\Clientes\IndexClientesAction;
use App\Actions\Clientes\TopCompradoresPorQuantidadeAction;
use App\Actions\Clientes\TopCompradoresPorValorAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\Clientes\ClienteListagemResource;
use App\Http\Resources\Clientes\TopCompradoresPorQuantidadeResource;
use App\Http\Resources\Clientes\TopCompradoresPorValorResource;
use App\Models\CashbackConfig;
use App\Models\Cliente;
use App\Models\Configuracao;
use App\Models\Empresa;
use App\Models\FidelidadeConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ClienteController extends Controller
{
    public Empresa $empresa;
    public ?FidelidadeConfig $fidelidadeConfig;
    public ?CashbackConfig $cashbackConfig;
    function __construct(
        Request $request,
    )
    {
        $this->empresa = Empresa::query()->where("cnpj", $request->route('cnpj'))->firstOrFail();
        $this->fidelidadeConfig = FidelidadeConfig::query()->where("empresa_id", $this->empresa->id)->where('ativo', true)->first();
        $this->cashbackConfig = CashbackConfig::query()->where("empresa_id", $this->empresa->id)->where('status', true)->first();
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, IndexClientesAction $action)
    {
        $configuracaoPeriodoInatividadeCliente = Configuracao::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->where('configuracao', 'periodo_inatividade_cliente')->first();
        $diasInatividadeCliente = intval($configuracaoPeriodoInatividadeCliente?->getAttribute('valor'));
        $periodoInatividadeCliente = boolval($diasInatividadeCliente);

        $filtros = $request->only([
            'nome', 'telefone', 'primeira_compra_inicio', 'primeira_compra_fim',
            'ultima_compra_inicio', 'ultima_compra_fim', 'proximo_meta', 'sort_by', 'sort_dir',
        ]);
        $filtros['proximo_meta'] = filter_var($filtros['proximo_meta'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $clientes = $action->handle($this->empresa, $filtros, $this->fidelidadeConfig, $diasInatividadeCliente);
        $clientes->through(fn (Cliente $cliente) => (new ClienteListagemResource($cliente))->resolve());

        return Inertia::render('Empresa/Clientes/Clientes', [
            'periodoInatividadeCliente' => $periodoInatividadeCliente,
            'diasInatividadeCliente' => $diasInatividadeCliente,
            'fidelidadeConfig' => $this->fidelidadeConfig,
            'cashbackConfig' => $this->cashbackConfig,
            'clientes' => $clientes,
            'filtros' => $filtros,
            'timezone' => $this->empresa->resolveTimezone(),
        ]);
    }

    public function detalhe(string $cnpj, int $cliente_id, DetalheClienteAction $action): JsonResponse
    {
        // Sem essa checagem, qualquer empresa autenticada poderia ver nome, telefone e
        // endereços de um cliente que nunca comprou dela, só sabendo o cliente_id.
        $cliente = Cliente::query()
            ->whereHas('pedidos', fn ($query) => $query->where('empresa_id', $this->empresa->id))
            ->findOrFail($cliente_id);

        try {
            $dados = $action->handle($this->empresa, $cliente, $this->fidelidadeConfig, $this->cashbackConfig);
        } catch (\Throwable $th) {
            Log::error('Não foi possivel localizar o detalhe do cliente', [
                'exception' => $th,
                'message' => $th->getMessage(),
                'empresa_id' => $this->empresa->id,
                'cliente_id' => $cliente_id,
            ]);
            return response()->json(['message' => 'Não foi possivel localizar o detalhe do cliente'], 400);
        }

        return response()->json($dados);
    }

    public function consultaDadosPainelCashback(string $cnpj, ConsultaDadosPainelCashbackAction $action): JsonResponse {
        $dados = null;
        try {
            $dados = $action->handle($this->empresa->id, $this->fidelidadeConfig);
        } catch (\Throwable $th) {
            Log::error('Não foi possivel localizar os dados do painel de cashback', [
                'exception' => $th,
                'message' => $th->getMessage(),
                'empresa_id' => $this->empresa->id,
            ]);
            return response()->json(['message' => 'Não foi possivel localizar os dados do painel de cashback'], 400);
        }
        return response()->json(['dados' => $dados]);
    }

    public function topCompradoresPorValor(string $cnpj, TopCompradoresPorValorAction $action): JsonResponse {
        try {
            $compradores = $action->handle($this->empresa);
        } catch (\Throwable $th) {
            Log::error('Não foi possivel localizar o top de compradores por valor', [
                'exception' => $th,
                'message' => $th->getMessage(),
                'empresa_id' => $this->empresa->id,
            ]);
            return response()->json(['message' => 'Não foi possivel localizar o top de compradores por valor'], 400);
        }

        return response()->json(['dados' => TopCompradoresPorValorResource::collection($compradores)]);
    }

    public function topCompradoresPorQuantidade(string $cnpj, TopCompradoresPorQuantidadeAction $action): JsonResponse {
        try {
            $compradores = $action->handle($this->empresa);
        } catch (\Throwable $th) {
            Log::error('Não foi possivel localizar o top de compradores por quantidade', [
                'exception' => $th,
                'message' => $th->getMessage(),
                'empresa_id' => $this->empresa->id,
            ]);
            return response()->json(['message' => 'Não foi possivel localizar o top de compradores por quantidade'], 400);
        }

        return response()->json(['dados' => TopCompradoresPorQuantidadeResource::collection($compradores)]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
