export type TStatusPedido =
    | "aguardando_item_premio"
    | "pendente"
    | "aguardando pagamento"
    | "aceito"
    | "sendo preparado"
    | "pronto para entrega"
    | "pronto para retirada"
    | "sendo entregue"
    | "entregue para mesa"
    | "pedido feito"
    | "entregue"
    | "retirado"
    | "cancelado";

export type TTipoPedido = "D" | "M" | "R";

export interface ICliente {
    id: number;
    nome: string;
    telefone: string;
    cpf_cnpj: string | null;
    data_nascimento: string | null;
}

export interface IEndereco {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
}

export interface IPagamento {
    forma_pagamento: string;
    valor: number;
    label: string;
}

export interface IFinanceiroPedido {
    total: number;
    subtotal_itens: number | null;
    subtotal_itens_ifood: number | null;
    adicional: number | null;
    cashback_utilizado: number | null;
    troco_para: number | null;
    valor_troco: number | null;
    forma_pagamento: string | null;
    forma_pagamento_label: string;
    pagamentos: IPagamento[];
}

export interface IPedidoItemComplemento {
    nome: string;
    qtde: number;
    preco_unitario: number;
}

export interface IPedidoItemSabor {
    nome: string;
    qtde: number;
    preco_unitario: number;
}

export interface IPedidoComboItemCustomizacao {
    nome: string;
    preco_unitario: number;
    qtde: number;
}

export interface IPedidoComboItem {
    tipo: "item" | "complemento";
    grupo_nome: string;
    item_nome: string;
    preco_unitario: number;
    qtde: number;
    customizacoes: IPedidoComboItemCustomizacao[];
}

export interface IPedidoItem {
    id: number;
    tipo: "I" | "P" | "C";
    tipo_preco: string | null;
    nome: string;
    quantidade: number;
    preco_unitario: number;
    preco_original: number | null;
    subtotal: number;
    observacao: string | null;
    item_premio: boolean;
    borda: { nome: string; preco: number } | null;
    massa: { nome: string; preco: number } | null;
    complementos: IPedidoItemComplemento[];
    sabores: IPedidoItemSabor[];
    combo_itens: IPedidoComboItem[];
}

export interface ICupomUsadoNoPedido {
    id: number;
    nome_cupom: string;
    tipo_cupom: "reais" | "porcentagem";
    valor_desconto: number;
    onde_afetara: "produto" | "frete";
    valor_maximo_desconto: number;
}

export interface ICupomUsadoNoIfood {
    valor: number;
    alvo_desconto: string | null;
    alvo_desconto_eh_frete: boolean;
    responsavel_desconto: string | null;
    responsavel_desconto_label: string | null;
}

export interface IPedido {
    id: number;
    ifood_display_id: string | null;
    pedido_ifood_id: string | null;
    tipo: TTipoPedido;
    status: TStatusPedido;
    prioridade: boolean;
    observacao: string | null;
    codigo_coleta: string | null;
    valor_frete: number;
    nome: string | null;
    telefone: string | null;
    cpf_cnpj_ifood: string | null;
    mesa: string | null;
    comanda: string | null;
    eh_agendado: boolean;
    data_agendamento_inicio: string | null;
    data_agendamento_fim: string | null;
    data_inicio_preparo: string | null;
    fidelidade_recompensa_aplicada: string | null;
    fidelidade_desconto: number | null;
    fidelidade_percentual: number | null;
    fidelidade_base_calculo: string | null;
    frete_original: number | null;
    created_at: string;
    // Campos abaixo dependem de quais relações o backend carregou (whenLoaded) —
    // podem estar ausentes (não apenas null) dependendo do endpoint de origem.
    cliente?: ICliente | null;
    financeiro?: IFinanceiroPedido | null;
    itens?: IPedidoItem[];
    endereco_entrega?: IEndereco | null;
    endereco_entrega_ifood?: IEndereco | null;
    dados_retirada_pedido?: boolean | null;
    cupom_usado_no_pedido?: ICupomUsadoNoPedido | null;
    cupons_usado_no_ifood?: ICupomUsadoNoIfood[];
    cashback?: { credito_gerado: number } | null;
    justificativa_cancelamento?: { motivo: string } | null;
}

export interface INotificacao {
    id: number;
    empresa_id: number;
    tipo: string;
    titulo: string;
    mensagem: string;
    data: Record<string, any> | null;
    lida: boolean;
    lida_em: string | null;
    created_at: string;
}

export interface IConfiguracoesPedidos {
    informa_mesa_comanda: boolean;
    modo_atendente: boolean;
    aceite_automatico: boolean;
    aceite_automatico_ifood: boolean;
}

export interface IItemMaisPedido {
    nome: string;
    qtde: number;
}

export interface IPedidoHistoricoLinha {
    id: number;
    created_at: string;
    valor: number | null;
    forma_pagamento: string | null;
    tipo_pedido: string;
}

export interface IHistoricoCliente {
    cliente: {
        id: number;
        nome: string;
        telefone: string;
        cpf_cnpj: string | null;
        data_nascimento: string | null;
        endereco: IEndereco | null;
    };
    itens_mais_pedidos: IItemMaisPedido[];
    qtde_pedidos: number;
    total_gasto: number;
    primeiro_pedido: string | null;
    ultimo_pedido: string | null;
    pedidos: {
        data: IPedidoHistoricoLinha[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export interface IPedidoTodosLinha {
    id: number;
    ifood_display_id: string | null;
    pedido_ifood_id: string | null;
    created_at: string;
    cliente_nome: string | null;
    cliente_telefone: string | null;
    tipo: TTipoPedido;
    mesa: string | null;
    status: TStatusPedido;
    total: number;
    forma_pagamento_label: string;
}
