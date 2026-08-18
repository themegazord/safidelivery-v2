<?php

namespace App\Http\Controllers\Empresa\Pedidos;

use App\Actions\Pedidos\BaixaEvidenciasZipAction;
use App\Actions\Pedidos\IndexNotificacoesAction;
use App\Actions\Pedidos\MarcarNotificacoesLidasAction;
use App\Actions\Pedidos\RespondeNegociacaoAction;
use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Models\Notificacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class NotificacaoController extends Controller
{
    public Empresa $empresa;

    public function __construct(Request $request)
    {
        $this->empresa = Empresa::query()->where('cnpj', $request->route('cnpj'))->firstOrFail();
    }

    public function index(IndexNotificacoesAction $action): JsonResponse
    {
        $resultado = $action->handle($this->empresa);

        return response()->json([
            'notificacoes' => $resultado['notificacoes'],
            'disputasPendentes' => $resultado['disputas_pendentes'],
            'settlements' => $resultado['settlements'],
        ]);
    }

    public function marcarLidas(Request $request, MarcarNotificacoesLidasAction $action): JsonResponse
    {
        $ids = $request->input('ids', []);
        $action->handle($this->empresa, $ids);

        return response()->json(['mensagem' => 'Notificações marcadas como lidas']);
    }

    public function responderNegociacao(Request $request, string $cnpj, int $notificacao_id, RespondeNegociacaoAction $action): JsonResponse
    {
        $notificacao = Notificacao::where('empresa_id', $this->empresa->id)->findOrFail($notificacao_id);

        $dados = $request->validate([
            'tipo_proposta' => ['required', 'string'],
            'negociacao' => ['required', 'array'],
        ]);

        try {
            $resultado = $action->handle($this->empresa, $notificacao, $dados['tipo_proposta'], $dados['negociacao']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json($resultado);
    }

    public function evidencias(Request $request, string $cnpj, int $notificacao_id, BaixaEvidenciasZipAction $action): BinaryFileResponse
    {
        $notificacao = Notificacao::where('empresa_id', $this->empresa->id)->findOrFail($notificacao_id);
        $evidencias = $notificacao->data['metadata']['metadata']['evidences'] ?? [];

        $zipPath = $action->handle($this->empresa, $evidencias);

        return response()->download($zipPath)->deleteFileAfterSend(true);
    }
}
