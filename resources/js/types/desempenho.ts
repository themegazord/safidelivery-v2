

export interface MetricasDesempenho {
    faturamentoPeriodo: number
    faturamentoPeriodoAnterior: number
    crescimentoFaturamento: number
    totalPedidosEntregues: number
    totalPedidosCancelados: number
    taxaCancelamento: number
    ticketMedio: number
    pedidosIfood: number
    pedidosDireto: number
}

export interface FaturamentoDiarioItem {
    date: string
    faturamento: number
}

export interface ChartFaturamentoDiario {
    data: FaturamentoDiarioItem[]
    config: {
        faturamento: { label: string; color: string }
    }
}

export interface FormaPagamentoItem {
    forma: string
    quantidade: number
    fill: string
}

export interface FormaPagamentoConfigItem {
    label: string
    color?: string
}

export interface ChartFormasPagamento {
    data: FormaPagamentoItem[]
    config: Record<string, FormaPagamentoConfigItem>
}

export interface HorarioPicoItem {
    hora: string
    pedidos: number
}

export interface ChartHorariosPico {
    data: HorarioPicoItem[]
    config: {
        pedidos: { label: string; color: string }
    }
}

export interface ModalidadeItem {
    modalidade: 'delivery' | 'mesa' | 'retirada'
    pedidos: number
    fill: string
}

export interface ChartModalidade {
    data: ModalidadeItem[]
    config: {
        pedidos: { label: string }
        delivery: { label: string; color: string }
        mesa: { label: string; color: string }
        retirada: { label: string; color: string }
    }
}

export interface ChartsDesempenho {
    faturamentoDiario: ChartFaturamentoDiario
    formasPagamento: ChartFormasPagamento
    horariosPico: ChartHorariosPico
    modalidade: ChartModalidade
}

export interface DadosDesempenho {
    metricas: MetricasDesempenho
    charts: ChartsDesempenho
}
