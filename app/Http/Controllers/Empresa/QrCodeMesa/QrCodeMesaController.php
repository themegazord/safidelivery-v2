<?php

namespace App\Http\Controllers\Empresa\QrCodeMesa;

use App\Actions\QrCodeMesa\AtualizaMesaAction;
use App\Actions\QrCodeMesa\CriaMesaAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\QrCodeMesa\MesaRequest;
use App\Models\Empresa;
use App\Models\Mesa;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class QrCodeMesaController extends Controller
{
    public Empresa $empresa;

    public function __construct()
    {
        $this->empresa = Empresa::where('cnpj', request('cnpj'))->firstOrFail();
    }

    public function index()
    {
        $mesas = Mesa::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->orderBy('mesa')
            ->get()
            ->map(fn (Mesa $mesa) => $this->formataMesa($mesa));

        return Inertia::render('Empresa/QrCodeMesa/QrCodeMesa', [
            'mesas' => $mesas,
        ]);
    }

    private function formataMesa(Mesa $mesa): array
    {
        return [
            'id' => $mesa->getAttribute('id'),
            'mesa' => (int) $mesa->getAttribute('mesa'),
            'link_gerado' => $mesa->getAttribute('link_gerado'),
        ];
    }

    public function store(MesaRequest $request, CriaMesaAction $action): JsonResponse
    {
        $mesa = $action->handle($this->empresa, (int) $request->validated()['mesa']);

        return response()->json([
            'mensagem' => 'Mesa cadastrada com sucesso',
            'mesa' => $this->formataMesa($mesa),
        ]);
    }

    public function update(MesaRequest $request, AtualizaMesaAction $action, string $mesa_id): JsonResponse
    {
        $mesa = Mesa::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->findOrFail($mesa_id);

        $action->handle($this->empresa, $mesa, (int) $request->validated()['mesa']);

        return response()->json([
            'mensagem' => 'Mesa atualizada com sucesso',
            'mesa' => $this->formataMesa($mesa->refresh()),
        ]);
    }

    public function destroy(string $cnpj, string $mesa_id): JsonResponse
    {
        $mesa = Mesa::query()
            ->where('empresa_id', $this->empresa->getAttribute('id'))
            ->findOrFail($mesa_id);

        $mesa->delete();

        return response()->json(['mensagem' => 'Mesa removida com sucesso']);
    }
}
