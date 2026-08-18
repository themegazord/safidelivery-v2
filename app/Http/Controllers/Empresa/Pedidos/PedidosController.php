<?php

namespace App\Http\Controllers\Empresa\Pedidos;

use App\Actions\Pedidos\AlteraStatusPedidoAction;
use App\Actions\Pedidos\BuscaMotivosCancelamentoIfoodAction;
use App\Actions\Pedidos\CancelaPedidoAction;
use App\Actions\Pedidos\IndexNotificacoesAction;
use App\Actions\Pedidos\IndexPedidosKanbanAction;
use App\Actions\Pedidos\ShowPedidoAction;
use App\Actions\Pedidos\VerificaPedidosNovosAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Pedidos\AtualizaConfiguracaoPedidosRequest;
use App\Http\Resources\Pedidos\PedidoResource;
use App\Models\Configuracao;
use App\Models\Empresa;
use App\Models\Pedido;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class PedidosController extends Controller
{
    private const CONFIGURACOES_KANBAN = ['informa_mesa_comanda', 'modo_atendente', 'aceite_automatico', 'aceite_automatico_ifood'];

    public Empresa $empresa;

    public function __construct(Request $request)
    {
        $this->empresa = Empresa::query()->where('cnpj', $request->route('cnpj'))->firstOrFail();
    }

    public function index(IndexPedidosKanbanAction $indexPedidos, IndexNotificacoesAction $indexNotificacoes)
    {
        $configuracoes = array_fill_keys(self::CONFIGURACOES_KANBAN, false);
        $configs = $this->empresa->configuracoes()
            ->whereIn('configuracao', self::CONFIGURACOES_KANBAN)
            ->get(['configuracao', 'valor']);

        foreach ($configs as $config) {
            $configuracoes[$config->getAttribute('configuracao')] = (bool) $config->getAttribute('valor');
        }

        $pedidos = $indexPedidos->handle($this->empresa);
        $notificacoesResultado = $indexNotificacoes->handle($this->empresa);

        return Inertia::render('Empresa/Pedidos/Kanban', [
            'pedidos' => PedidoResource::collection($pedidos)->resolve(),
            'notificacoes' => $notificacoesResultado['notificacoes'],
            'disputasPendentes' => $notificacoesResultado['disputas_pendentes'],
            'settlements' => $notificacoesResultado['settlements'],
            'configuracoes' => $configuracoes,
            'timezone' => $this->empresa->resolveTimezone(),
        ]);
    }

    public function show(string $cnpj, int $pedido_id, ShowPedidoAction $action): JsonResponse
    {
        $pedido = $action->handle($this->empresa, $pedido_id);

        return response()->json(['pedido' => new PedidoResource($pedido)]);
    }

    public function atualizaConfiguracao(string $cnpj, AtualizaConfiguracaoPedidosRequest $request): JsonResponse
    {
        $dados = $request->validated();

        Configuracao::updateOrCreate(
            ['empresa_id' => $this->empresa->getAttribute('id'), 'configuracao' => $dados['chave']],
            ['valor' => $dados['valor']],
        );

        return response()->json(['mensagem' => 'Configuração salva com sucesso']);
    }

    public function status(Request $request, string $cnpj, int $pedido_id, AlteraStatusPedidoAction $action): JsonResponse
    {
        $dados = $request->validate(['novo_status' => ['required', 'string']]);

        try {
            $resultado = $action->handle($pedido_id, $dados['novo_status']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        if ($resultado['requer_confirmacao']) {
            return response()->json([
                'requer_confirmacao' => true,
                'pedido' => new PedidoResource($resultado['pedido']),
            ]);
        }

        return response()->json([
            'requer_confirmacao' => false,
            'mensagem' => 'Status atualizado com sucesso!',
            'pedido' => new PedidoResource($resultado['pedido']),
        ]);
    }

    public function motivosCancelamentoIfood(string $cnpj, int $pedido_id, BuscaMotivosCancelamentoIfoodAction $action): JsonResponse
    {
        $pedido = Pedido::where('empresa_id', $this->empresa->id)->findOrFail($pedido_id);

        return response()->json(['motivos' => $action->handle($pedido)]);
    }

    public function cancelar(Request $request, string $cnpj, int $pedido_id, CancelaPedidoAction $action): JsonResponse
    {
        $pedido = Pedido::where('empresa_id', $this->empresa->id)->findOrFail($pedido_id);

        $regras = $pedido->pedido_ifood_id !== null
            ? ['motivo_codigo' => ['required', 'string'], 'motivo_descricao' => ['required', 'string']]
            : ['mensagem' => ['required', 'string']];

        $dados = $request->validate($regras);

        try {
            $mensagem = $action->handle($pedido, $dados);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['mensagem' => $mensagem]);
    }

    public function confirmarEntrega(string $cnpj, int $pedido_id, AlteraStatusPedidoAction $action): JsonResponse
    {
        $pedido = Pedido::where('empresa_id', $this->empresa->id)
            ->with(['cliente', 'financeiro', 'dadosRetiradaPedido'])
            ->findOrFail($pedido_id);

        $action->aplicar($pedido, 'entregue');

        return response()->json(['mensagem' => 'Pedido marcado como entregue!', 'pedido' => new PedidoResource($pedido)]);
    }

    public function urlImpressao(string $cnpj, int $pedido_id): JsonResponse
    {
        Pedido::withTrashed()->where('empresa_id', $this->empresa->id)->findOrFail($pedido_id);

        $url = URL::temporarySignedRoute('pedido.imprimir', now()->addMinutes(5), ['pedido_id' => $pedido_id]);

        return response()->json(['url' => $url]);
    }

    public function verificaNovos(VerificaPedidosNovosAction $action): JsonResponse
    {
        $resultado = $action->handle($this->empresa);

        return response()->json([
            'tocar_som' => $resultado['tocar_som'],
            'pedidos' => PedidoResource::collection($resultado['pedidos'])->resolve(),
        ]);
    }
}
