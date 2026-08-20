export type TFidelidadeConfig = {
    id: number;
    empresa_id: number;
    ativo: boolean;
    tipo_gatilho: "qtd_pedidos" | "valor_acumulado";
    valor_gatilho: number;
    tipo_recompensa:
        | "item_gratis"
        | "frete_gratis"
        | "desconto_percentual"
        | "desconto_fixo";
    valor_recompensa: number;
    base_calculo_desconto: "subtotal_itens" | "total_pedido";
    valor_max_premio: number;
    categorias_bloquadas: string[];
    validade_dias: number;
    tipos_funcionamento: string[];
};

export type TCashbackConfig = {
    id: number;
    empresa_id: number;
    status: boolean;
    cashback_porcentagem: number;
    base_calculo_porcentagem: string;
    cashback_fixo: number;
    cashback_tipo: "porcentagem" | "fixo";
    tipos_funcionamento: string[];
    dias_validade: number;
};

export type TDadosFidelidade = {
    cashback_emitido: number;
    cashback_utilizado: number;
    cashback_a_vencer_30d: number;
    cashback_saldo_ativo: number;
    clientes_com_recompensa: number;
    clientes_proximos_meta: number;
};

export type TTopCompradoresPorValor = {
    id: number;
    nome: string;
    telefone: string;
    valor_total_gasto: number;
    total_pedidos: number;
}

export type TTopCompradoresPorQuantidade = {
    id: number;
    nome: string;
    telefone: string;
    valor_total_gasto: number;
    total_pedidos: number;
}

export type TClienteListagem = {
    id: number;
    nome: string;
    telefone: string;
    primeira_compra: string | null;
    ultima_compra: string | null;
    valor_total_gasto: number;
    total_pedidos: number;
    ticket_medio: number;
    saldo_cashback: number;
    pontos_fidelidade: number;
    valor_acumulado_fidelidade: number;
    recompensa_disponivel: boolean;
    esta_ativo: boolean | null;
};

export type TFiltrosClientes = {
    nome?: string;
    telefone?: string;
    primeira_compra_inicio?: string;
    primeira_compra_fim?: string;
    ultima_compra_inicio?: string;
    ultima_compra_fim?: string;
    proximo_meta?: boolean;
    sort_by?: string;
    sort_dir?: "asc" | "desc";
};

export type TEnderecoCliente = {
    id: number;
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
};

export type TFidelidadeProgressoCliente = {
    contador_atual: number;
    valor_acumulado: number;
    recompensa_disponivel: boolean;
    recompensa_tipo: TFidelidadeConfig["tipo_recompensa"] | null;
    recompensa_expira_em: string | null;
};

export type TResumoCashbackCliente = {
    saldo_disponivel: number;
    total_gerado: number;
    total_utilizado: number;
};

export type THistoricoCashbackCliente = {
    pedido_id: number;
    credito_gerado: number;
    saldo_restante: number;
    data_gerado: string;
    data_vencimento: string;
};

export type THistoricoFidelidadeCliente = {
    id: number;
    created_at: string;
    fidelidade_desconto: number;
    fidelidade_recompensa_aplicada: string | null;
};

export type THistoricoPedidoCliente = {
    id: number;
    created_at: string;
    status: string;
    total: number;
    forma_pagamento_label: string | null;
    fidelidade_recompensa_aplicada: string | null;
};

export type TItemMaisPedidoCliente = {
    nome: string;
    total_pedido: number;
};

export type TFormaPagamentoCliente = {
    forma_pagamento: string; // já vem formatado para exibição (ex: "Pix", "Cartão de Crédito")
    total: number;
};

export type TClienteDetalhe = {
    cliente: {
        id: number;
        nome: string;
        telefone: string;
        email: string | null;
        cpf_cnpj: string | null;
        enderecos: TEnderecoCliente[];
    };
    fidelidade_progresso: TFidelidadeProgressoCliente | null;
    resumo_cashback: TResumoCashbackCliente | null;
    historico_cashback: THistoricoCashbackCliente[];
    historico_fidelidade: THistoricoFidelidadeCliente[];
    historico_pedidos: THistoricoPedidoCliente[];
    itens_mais_pedidos: TItemMaisPedidoCliente[];
    formas_pagamento: TFormaPagamentoCliente[];
};
