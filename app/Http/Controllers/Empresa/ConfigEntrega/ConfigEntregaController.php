<?php

namespace App\Http\Controllers\Empresa\ConfigEntrega;

use App\Actions\ConfigEntrega\AtualizaConfiguracoesGeraisEntregaAction;
use App\Actions\ConfigEntrega\SalvaTaxasEntregaAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\ConfigEntrega\ConfiguracoesGeraisEntregaRequest;
use App\Http\Requests\ConfigEntrega\SalvaTaxasEntregaRequest;
use App\Models\Configuracao;
use App\Models\Empresa;
use App\Models\TaxaEntrega;
use App\Services\Google\GoogleMapService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ConfigEntregaController extends Controller
{
    public Empresa $empresa;

    public function __construct()
    {
        $this->empresa = Empresa::with('endereco')->where('cnpj', request('cnpj'))->firstOrFail();
    }

    public function index(GoogleMapService $service)
    {
        $latitude = null;
        $longitude = null;

        if ($this->empresa->endereco) {
            try {
                $coordenadas = $service->handleGeocoding($this->empresa->endereco->enderecoSemComplementoFormatado());
                $latitude = (float) $coordenadas['latitude'];
                $longitude = (float) $coordenadas['longitude'];
            } catch (\Throwable $th) {
                Log::error('Não foi possivel geocodificar o endereço da empresa para configuração de entrega', [
                    'exception' => $th,
                    'message' => $th->getMessage(),
                    'empresa_id' => $this->empresa->id,
                ]);
            }
        }

        $taxas = TaxaEntrega::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->orderBy('raio')
            ->get(['id', 'tipo', 'raio', 'tempo', 'taxa', 'corCirculo', 'corPreenchimento', 'coordenadas']);

        $configuracoes = Configuracao::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->whereIn('configuracao', ['taxa_fixa', 'valor_minimo_pedido', 'frete_gratis_acima', 'prioridade_zona_sobreposicao'])
            ->pluck('valor', 'configuracao');

        return Inertia::render('Empresa/ConfigEntrega/ConfigEntrega', [
            'empresa' => [
                'nome_fantasia' => $this->empresa->getAttribute('nome_fantasia'),
                'latitude' => $latitude,
                'longitude' => $longitude,
            ],
            'taxasPorRaio' => $taxas->map(fn (TaxaEntrega $taxa) => [
                'id' => $taxa->getAttribute('id'),
                'tipo' => $taxa->getAttribute('tipo') ?? 'raio',
                'raio' => (float) $taxa->getAttribute('raio'),
                'tempo' => (int) $taxa->getAttribute('tempo'),
                'taxa' => (float) $taxa->getAttribute('taxa'),
                'corCirculo' => $taxa->getAttribute('corCirculo'),
                'corPreenchimento' => $taxa->getAttribute('corPreenchimento'),
                'coordenadas' => $taxa->getAttribute('coordenadas'),
            ])->values(),
            'configuracoesGerais' => [
                'taxa_fixa' => isset($configuracoes['taxa_fixa']) ? (float) $configuracoes['taxa_fixa'] : null,
                'valor_minimo_pedido' => isset($configuracoes['valor_minimo_pedido']) ? (float) $configuracoes['valor_minimo_pedido'] : null,
                'frete_gratis_acima' => isset($configuracoes['frete_gratis_acima']) ? (float) $configuracoes['frete_gratis_acima'] : null,
                'prioridade_zona_sobreposicao' => $configuracoes['prioridade_zona_sobreposicao'] ?? 'poligono',
            ],
            'googleMapsApiKey' => env('GOOGLE_API_TOKEN'),
            'googleMapsMapId' => env('GOOGLE_MAPS_MAP_ID', 'DEMO_MAP_ID'),
        ]);
    }

    public function atualizaConfiguracoesGerais(ConfiguracoesGeraisEntregaRequest $request, AtualizaConfiguracoesGeraisEntregaAction $action): JsonResponse
    {
        $action->handle($this->empresa, $request->validated());

        return response()->json(['mensagem' => 'Configurações salvas com sucesso']);
    }

    public function salvarTaxas(SalvaTaxasEntregaRequest $request, SalvaTaxasEntregaAction $action): JsonResponse
    {
        $action->handle($this->empresa, $request->validated()['taxas']);

        return response()->json(['mensagem' => empty($request->validated()['taxas']) ? 'Faixas removidas com sucesso' : 'Taxas cadastradas com sucesso']);
    }
}
