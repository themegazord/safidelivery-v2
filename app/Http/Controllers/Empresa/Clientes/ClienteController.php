<?php

namespace App\Http\Controllers\Empresa\Clientes;

use App\Actions\Clientes\ConsultaDadosPainelCashbackAction;
use App\Actions\Clientes\TopCompradoresPorValorAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\Clientes\TopCompradoresPorValorResource;
use App\Models\CashbackConfig;
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
    public function index()
    {
        $configuracaoPeriodoInatividadeCliente = Configuracao::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->where('configuracao', 'periodo_inatividade_cliente')->firstOrFail();
        $periodoInatividadeCliente = boolval(intval($configuracaoPeriodoInatividadeCliente?->getAttribute('valor')));
        return Inertia::render('Empresa/Clientes/Clientes', [
            'periodoInatividadeCliente' => $periodoInatividadeCliente,
            'fidelidadeConfig' => $this->fidelidadeConfig,
            'cashbackConfig' => $this->cashbackConfig,
        ]);
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
