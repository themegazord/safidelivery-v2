

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

export interface IFinanceiroPedidos {
    adicional?: number 
    cashback_utilizado?: number,
    created_at?: string,
    forma_pagamento?: IFormaPagamento,
    forma_pagamento_id?: number,
    pedido_id?: number,
    subtotal_itens?: number,
    subtotal_itens_ifood?: number ,
    total?: number,
    troco_para?: number,
    updated_at?: string,
    uuid?: string,
    valor_desconto?: number,
    valor_troco?: number,
}

export interface IPedido {
  cliente_id: number;
  codigo_coleta: string | null;
  comanda: string | null;
  cpf_cnpj_ifood: string | null;
  created_at: string;
  data_agendamento_fim: string | null;
  data_agendamento_inicio: string | null;
  data_inicio_preparo: string | null;
  deleted_at: string | null;
  eh_agendado: number;
  empresa_id: number;
  endereco_entrega_id: number;
  endereco_entrega_ifood: string | null;
  fidelidade_base_calculo: number | null;
  fidelidade_desconto: string | null;
  fidelidade_percentual: number | null;
  fidelidade_recompensa_aplicada: boolean | null;
  financeiro: IFinanceiroPedidos;
  frete_original: number | null;
  id: number;
  ifood_display_id: string | null;
  ifood_entregue_por: boolean | null;
  informa_comanda_manual: number;
  mesa: string | null;
  nome: string;
  observacao: string | null;
  pedido_ifood_id: number | null;
  prioridade: number;
  status: string;
  telefone: string;
  tipo: string;
  updated_at: string;
  valor_frete: number;
}

export interface IFormaPagamento {
    codigo_pdv?: number,
    created_at?: string,
    deleted_at?: string,
    descricao?: string,
    empresa_id?: number,
    id?: number,
    interno?: number,
    tipo?: string,
    updated_at?: string
}

export interface DadosDesempenho {
    financeiro_pedidos: IFinanceiroPedidos[]
    financeiro_pedidos_hoje: IFinanceiroPedidos[]
    pedidos: IPedido[]
    pedidos_hoje: IPedido[]
    metricas: MetricasDesempenho
    charts: ChartsDesempenho

}
