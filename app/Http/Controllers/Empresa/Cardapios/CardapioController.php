<?php

namespace App\Http\Controllers\Empresa\Cardapios;

use App\Actions\Cardapios\CloneCardapioAction;
use App\Actions\Cardapios\DestroyCardapioAction;
use App\Actions\Cardapios\ExportCardapioAction;
use App\Actions\Cardapios\ImportCardapioIFOODAction;
use App\Actions\Cardapios\ShowCardapioAction;
use App\Actions\Cardapios\StoreCardapioAction;
use App\Actions\Cardapios\UpdateCardapioAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cardapios\CloneCardapioRequest;
use App\Http\Requests\Cardapios\ImportIFOODRequest;
use App\Http\Requests\Cardapios\StoreCardapioRequest;
use App\Http\Requests\Cardapios\UpdateCardapioRequest;
use App\Models\Empresa;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CardapioController extends Controller
{
    public Empresa $empresa;
    public function __construct(Request $request)
    {
        $this->empresa = Empresa::query()->where('cnpj', $request->route('cnpj') ?? request('cnpj'))->firstOrFail();
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $existeTokenAnotaai = !\is_null($this->empresa->integracoes->where('tipo', 'anotaai')->value('companyToken'));
        $ifoodTokenBuilder = $this->empresa->integracoes->where('tipo', 'ifood');
        $existeTokensIFOOD = !\is_null($ifoodTokenBuilder->value('clientId'))
            && !\is_null($ifoodTokenBuilder->value('clientSecret'))
            && !\is_null($ifoodTokenBuilder->value('merchantId'));
        $cardapios = $this->carregaCardapio($this->empresa);
        return Inertia::render('Empresa/Cardapios/ListagemCardapio', [
            'existeTokensIFOOD' => $existeTokensIFOOD,
            'existeTokenAnotaai' => $existeTokenAnotaai,
            'cardapios' => $cardapios
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCardapioRequest $request, StoreCardapioAction $action): RedirectResponse
    {
        $dados = [
            ...$request->validated(),
            'empresa_id' => $this->empresa->getAttribute('id'),
        ];

        $action->handle($dados);
        return redirect()->back();
    }

    /**
     * Display the specified resource.
     */
    public function show(string $cnpj, string $cardapio_id, ShowCardapioAction $action)
    {
        try {
            $cardapio = $action->handle($cardapio_id, $this->empresa->getAttribute('id'));

            return response()->json(['cardapio' => $cardapio]);
        } catch (ModelNotFoundException $mnfe) {
            return response()->json(['mensagem' => 'Não foi possivel localizar esse cardápio.', Response::HTTP_NOT_FOUND]);
        } catch (Exception $e) {
            return response()->json(['mensagem' => 'Algo de estranho aconteceu ao consultar esse cardápio, por favor, entre em contato com o suporte.', Response::HTTP_INTERNAL_SERVER_ERROR]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCardapioRequest $request, string $cnpj, string $cardapio_id, UpdateCardapioAction $action)
    {
        try {
            $dados = $request->validated();
            $cardapioAtualizado = $action->handle($dados, $cardapio_id, $this->empresa->getAttribute('id'));
            return redirect()->back();
        } catch (ModelNotFoundException $mnfe) {
            return response()->json(['mensagem' => 'Não foi possivel encontrar o cardápio para atualização dos dados.'], Response::HTTP_NOT_FOUND);
        } catch (Exception $e) {
            return response()->json(['mensagem' => 'Não foi possivel atualizar este cardápio, por favor, entrar em contato com o suporte'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $cnpj, string $cardapio_id, DestroyCardapioAction $action)
    {
        $action->handle($cardapio_id, $this->empresa->getAttribute('id'));
        return redirect()->back();
    }

    public function clone(CloneCardapioRequest $request, string $cnpj, int $cardapio_id, CloneCardapioAction $action) {
        $action->handle($this->empresa->getAttribute('id'), $cardapio_id, $request->validated()['novoNomeCardapio']);
        return redirect()->back();
    }

    public function export(string $cnpj, int $cardapio_id, string $tipo, ExportCardapioAction $action): StreamedResponse
    {
        $arquivo = $action->handle($cardapio_id, $this->empresa->getAttribute('id'), $tipo);
        return response()->streamDownload(function () use ($arquivo) {
            echo $arquivo->stream();
        }, "cardapio-" . now()->format('d-m-Y-H-i-s') . ".{$tipo}");
    }

    public function importIfood(ImportIFOODRequest $request, string $cnpj, ImportCardapioIFOODAction $action): RedirectResponse {
        $ifood = $this->empresa->integracoes->where('tipo', 'ifood')->first();
        if (!$ifood && !$ifood->merchantId && !$ifood->clientSecret && !$ifood->clientId) {
            throw new Exception("Falha na importação do IFOOD. Falta completar a configuração das variaveis de importação.");
        }
        $dados = $request->validated();
        $merchantId = $this->empresa->integracoes->where('tipo', 'ifood')->value('merchantId');
        $action->handle($merchantId, $dados, $this->empresa->getAttribute('id'));

        return redirect()->back();
    }

    private function carregaCardapio(Empresa $empresa): Collection
    {
        return $empresa->cardapios;
    }
}
