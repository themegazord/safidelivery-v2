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

    public function atualizaDados(string $dias): array
    {
        $this->diasFiltro = (int) $dias;

        $this->fusoHorario = Configuracao::whereEmpresaId($this->empresa->getAttribute('id'))
            ->where('configuracao', 'fuso_horario')
            ->value('valor') ?? 'America/Sao_Paulo';

        $inicio = $this->agora()->startOfDay();
        $fim    = $this->agora()->copy()->subDays($this->diasFiltro)->startOfDay();

        $this->pedidos = Pedido::where('empresa_id', $this->empresa->getAttribute('id'))
            ->whereBetween('created_at', [$fim, $inicio])
            ->with('financeiro')
            ->get();

        $this->financeiroPedidos = $this->pedidos
            ->where('status', 'entregue')
            ->map(fn($pedido) => $pedido->financeiro)
            ->filter();

        $this->pedidosPeriodoAnterior = Pedido::query()->whereBetween('created_at', [
            $this->agora()->subDays($this->diasFiltro * 2)->startOfDay(),
            $this->agora()->subDays($this->diasFiltro)->endOfDay(),
        ])->with('financeiro')->get();

        $metricas = $this->calculaMetricas();
        $this->alimentaCharts();

        return [
            'pedidos' => $this->pedidos,
            'pedidos_hoje' => $this->pedidos->where('created_at', $this->agora()),
            'financeiro_pedidos' => $this->pedidos->where('status', 'entregue'),
            'metricas' => $metricas,
            'charts'   => [
                'faturamentoDiario' => $this->chartFaturamentoDiario,
                'formasPagamento'   => $this->chartFormasPagamento,
                'horariosPico'      => $this->chartHorariosPico,
                'modalidade'        => $this->chartModalidade,
            ],
        ];
    }

    private function calculaMetricas(): array
    {
        $this->faturamentoPeriodo = $this->financeiroPedidos->sum('total');

        $this->faturamentoPeriodoAnterior = $this->pedidosPeriodoAnterior
            ->where('status', 'entregue')
            ->map(fn($pedido) => $pedido->financeiro)
            ->filter()
            ->sum('total');

        $this->crescimentoFaturamento = $this->faturamentoPeriodoAnterior > 0
            ? (($this->faturamentoPeriodo - $this->faturamentoPeriodoAnterior) / $this->faturamentoPeriodoAnterior) * 100
            : ($this->faturamentoPeriodo > 0 ? 100 : 0);

        $this->totalPedidosEntregues = $this->pedidos->where('status', 'entregue')->count();
        $this->totalPedidosCancelados = $this->pedidos->where('status', 'cancelado')->count();

        $totalPedidos = $this->pedidos->count();
        $this->taxaCancelamento = $totalPedidos > 0
            ? ($this->totalPedidosCancelados / $totalPedidos) * 100
            : 0;

        // Ticket médio
        $this->ticketMedio = $this->totalPedidosEntregues > 0
            ? $this->faturamentoPeriodo / $this->totalPedidosEntregues
            : 0;

        // Pedidos iFood vs Direto
        $this->pedidosIfood = $this->pedidos->whereNotNull('pedido_ifood_id')->where('status', 'entregue')->count();
        $this->pedidosDireto = $this->totalPedidosEntregues - $this->pedidosIfood;

        return [
            'faturamentoPeriodo' => $this->faturamentoPeriodo,
            'faturamentoPeriodoAnterior' => $this->faturamentoPeriodoAnterior,
            'crescimentoFaturamento' => $this->crescimentoFaturamento,
            'totalPedidosEntregues' => $this->totalPedidosEntregues,
            'totalPedidosCancelados' => $this->totalPedidosCancelados,
            'taxaCancelamento' => $this->taxaCancelamento,
            'ticketMedio' => $this->ticketMedio,
            'pedidosIfood' => $this->pedidosIfood,
            'pedidosDireto' => $this->pedidosDireto,
        ];
    }

    private function alimentaCharts(): void
    {
        $this->montaChartFaturamentoDiario();
        $this->montaChartFormasPagamento();
        $this->montaChartHorariosPico();
        $this->montaChartModalidade();
    }

    private function montaChartFaturamentoDiario(): void
    {
        $faturamentoPorDia = $this->pedidos
            ->where('status', 'entregue')
            ->groupBy(fn($pedido) => $pedido->created_at->setTimezone($this->fusoHorario)->format('d/m'))
            ->map(fn($grupo) => $grupo->sum(fn($pedido) => $pedido->financeiro?->total ?? 0))
            ->toArray();

        $dados = [];

        for ($i = $this->diasFiltro; $i >= 0; $i--) {
            $data = $this->agora()->subDays($i)->format('d/m');
            $dados[] = [
                'date'        => $data,
                'faturamento' => $faturamentoPorDia[$data] ?? 0,
            ];
        }

        $this->chartFaturamentoDiario = [
            'data'   => $dados,
            'config' => [
                'faturamento' => ['label' => 'Faturamento', 'color' => '#22c55e'],
            ],
        ];
    }

    private function montaChartFormasPagamento(): void
    {
        $cores = [
            'pix'            => '#22c55e',
            'dinheiro'       => '#eab308',
            'master_credito' => '#ef4444',
            'visa_credito'   => '#3b82f6',
            'master_debito'  => '#f97316',
            'visa_debito'    => '#06b6d4',
            'elo_credito'    => '#8b5cf6',
            'elo_debito'     => '#a855f7',
            'amex_credito'   => '#14b8a6',
            'vr_refeicao'    => '#f43f5e',
            'alelo_refeicao' => '#84cc16',
            'outro_refeicao' => '#64748b',
        ];

        $nomes = [
            'pix'            => 'Pix',
            'dinheiro'       => 'Dinheiro',
            'master_credito' => 'Master Crédito',
            'visa_credito'   => 'Visa Crédito',
            'master_debito'  => 'Master Débito',
            'visa_debito'    => 'Visa Débito',
            'elo_credito'    => 'Elo Crédito',
            'elo_debito'     => 'Elo Débito',
            'amex_credito'   => 'Amex Crédito',
            'vr_refeicao'    => 'VR Refeição',
            'alelo_refeicao' => 'Alelo Refeição',
            'outro_refeicao' => 'Outro Vale Refeição',
        ];

        $pedidosComPagamento = $this->pedidos
            ->where('status', 'entregue')
            ->where('tipo', 'D')
            ->map(fn($pedido) => $pedido->financeiro)
            ->filter()
            ->filter(fn($financeiro) => ! empty($financeiro->forma_pagamento));

        $formasPagamento = $pedidosComPagamento
            ->groupBy('forma_pagamento')
            ->map(fn($grupo) => $grupo->count());

        $pedidosComCashback = $pedidosComPagamento
            ->filter(fn($financeiro) => ($financeiro->cashback_utilizado ?? 0) > 0)
            ->count();

        if ($pedidosComCashback > 0) {
            $formasPagamento->put('cashback', $pedidosComCashback);
            $nomes['cashback'] = 'Cashback';
            $cores['cashback'] = '#a855f7';
        }

        $data = [];
        $config = ['quantidade' => ['label' => 'Pedidos']];

        foreach ($formasPagamento as $forma => $quantidade) {
            $cor = $cores[$forma] ?? '#64748b';
            $data[] = [
                'forma'      => $forma,
                'quantidade' => $quantidade,
                'fill'       => $cor,
            ];
            $config[$forma] = [
                'label' => $nomes[$forma] ?? $forma,
                'color' => $cor,
            ];
        }

        $this->chartFormasPagamento = compact('data', 'config');
    }

    private function montaChartModalidade(): void
    {
        $this->chartModalidade = [
            'data' => [
                ['modalidade' => 'delivery', 'pedidos' => $this->pedidos->where('tipo', 'D')->where('status', 'entregue')->count(), 'fill' => '#3b82f6'],
                ['modalidade' => 'mesa',     'pedidos' => $this->pedidos->where('tipo', 'M')->where('status', 'entregue')->count(), 'fill' => '#22c55e'],
                ['modalidade' => 'retirada', 'pedidos' => $this->pedidos->where('tipo', 'R')->where('status', 'entregue')->count(), 'fill' => '#f59e0b'],
            ],
            'config' => [
                'pedidos'  => ['label' => 'Pedidos'],
                'delivery' => ['label' => 'Delivery',  'color' => '#3b82f6'],
                'mesa'     => ['label' => 'Mesa',      'color' => '#22c55e'],
                'retirada' => ['label' => 'Retirada',  'color' => '#f59e0b'],
            ],
        ];
    }

    private function montaChartHorariosPico(): void
    {
        $pedidosPorHora = $this->pedidos
            ->where('status', 'entregue')
            ->groupBy(fn($pedido) => (int) $pedido->created_at->setTimezone($this->fusoHorario)->format('H'))
            ->map(fn($grupo) => $grupo->count())
            ->toArray();
        // chaves agora são sempre int: 9, 10, 11...

        $data = [];
        for ($hora = 9; $hora <= 23; $hora++) {
            $data[] = [
                'hora'    => "{$hora}h",
                'pedidos' => $pedidosPorHora[$hora] ?? 0,
            ];
        }

        $this->chartHorariosPico = [
            'data'   => $data,
            'config' => [
                'pedidos' => ['label' => 'Pedidos', 'color' => '#6366f1'],
            ],
        ];
    }

    private function agora(): Carbon
    {
        return Carbon::now($this->fusoHorario);
    }
}
