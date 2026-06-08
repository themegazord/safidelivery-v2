<?php

namespace App\Services\Empresa;

use App\Models\Cardapio;
use App\Models\Configuracao;
use App\Models\Empresa;
use App\Models\FormaPagamento;
use App\Models\Pedido;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class DesempenhoService
{
    public int $diasFiltro = 7;

    public Collection $pedidos;

    public Collection $pedidosHoje;

    public Collection $pedidosPeriodoAnterior;

    public Collection $financeiroPedidos;

    public Collection $financeiroPedidosHoje;

    public Empresa $empresa;

    public ?string $fusoHorario = null;

    public array $necessidades = [];

    public bool $recebimentoPedidosIfood = false;

    // Métricas calculadas
    public float $faturamentoPeriodo = 0;

    public float $faturamentoPeriodoAnterior = 0;

    public float $crescimentoFaturamento = 0;

    public int $totalPedidosEntregues = 0;

    public int $totalPedidosCancelados = 0;

    public float $taxaCancelamento = 0;

    public float $ticketMedio = 0;

    public int $pedidosIfood = 0;

    public int $pedidosDireto = 0;

    // Charts
    public array $chartFaturamentoDiario = [];

    public array $chartFormasPagamento = [];

    public array $chartHorariosPico = [];

    public array $chartModalidade = [];

    public function verificaNecessidadesConfiguracao(int $empresa_id, string $empresa_cnpj): array
    {
        $configuracoesExistentes = Configuracao::whereEmpresaId($empresa_id)
            ->whereIn('configuracao', ['aceite_automatico', 'fuso_horario', 'funcionamentoEstabelecimento'])
            ->pluck('configuracao')
            ->toArray();

        $necessidades = [];

        if (! \in_array('aceite_automatico', $configuracoesExistentes)) {
            $necessidades[] = [
                'titulo' => 'Aceite automático não configurado',
                'mensagem' => 'Você deve configurar se a sua empresa vai ou não aceitar automáticamente os pedidos, caso queira que não seja, entre na rotina e clique em Salvar',
                'link' => [
                    'nomeRota' => 'aplicacao.empresa.desempenho',
                    'paramRota' => $empresa_cnpj
                ],
            ];
        }

        if (! \in_array('fuso_horario', $configuracoesExistentes)) {
            $necessidades[] = [
                'titulo' => 'Fuso horário não configurado',
                'mensagem' => 'Você deve configurar qual fuso horário sua empresa irá funcionar',
                'link' => [
                    'nomeRota' => 'aplicacao.empresa.desempenho',
                    'paramRota' => $empresa_cnpj
                ],
            ];
        }

        if (! \in_array('funcionamentoEstabelecimento', $configuracoesExistentes)) {
            $necessidades[] = [
                'titulo' => 'Funcionamento do estabelecimento não configurado',
                'mensagem' => 'Você deve configurar como vai ser o funcionamento do seu estabelecimento',
                'link' => [
                    'nomeRota' => 'aplicacao.empresa.desempenho',
                    'paramRota' => $empresa_cnpj
                ],
            ];
        }

        if (! FormaPagamento::where('empresa_id', $empresa_id)->exists()) {
            $necessidades[] = [
                'titulo' => 'Nenhuma forma de pagamento cadastrada',
                'mensagem' => 'Você deve cadastrar alguma forma de pagamento',
                'link' => [
                    'nomeRota' => 'aplicacao.empresa.desempenho',
                    'paramRota' => $empresa_cnpj
                ],
            ];
        }

        if (! Cardapio::where('empresa_id', $empresa_id)->exists()) {
            $necessidades[] = [
                'titulo' => 'Nenhum cardápio cadastrado',
                'mensagem' => 'Você deve cadastrar um cardápio com seus itens',
                'link' => [
                    'nomeRota' => 'aplicacao.empresa.desempenho',
                    'paramRota' => $empresa_cnpj
                ],
            ];
        }

        return $necessidades;
    }

    public function buscaPedidosPorData(string $dia_inicio, string $dia_fim): array
    {
        $pedidos = Pedido::where('empresa_id', $this->empresa->getAttribute('id'))
            ->whereBetween('created_at', [$dia_inicio, $dia_fim])
            ->with('financeiro')
            ->get();
        return [
            'pedidos' => $pedidos,
            'financeiro_pedidos' => $pedidos->where('status', 'entregue')
            ->map(fn($pedido) => $pedido->financeiro)
            ->filter()
        ];
    }

    private function agora(): Carbon
    {
        return Carbon::now($this->fusoHorario);
    }
}
