import { TipoRecompensaFidelidade } from "@/types/finalizar-pedido/fidelidade";

export interface IItemPedidoCliente {
    id: number;
    nome: string;
    quantidade: number;
}

export interface IPedidoCliente {
    id: number;
    ifood_display_id: string | null;
    tipo: "D" | "M" | "R";
    status: string;
    created_at: string;
    timezone: string;
    itens: IItemPedidoCliente[];
    financeiro: {
        total: number;
        forma_pagamento_label: string;
    } | null;
    cashback: {
        credito_gerado: number;
    } | null;
    empresa: {
        nome_fantasia: string;
        interacao_id: string;
    } | null;
}

export interface IProximoVencimentoCashback {
    pedido_id: number | null;
    saldo_restante: number;
    data_vencimento: string;
    timezone: string;
}

export interface ICashbackResumoCliente {
    gerado: number;
    usado: number;
    disponivel: number;
    pendente: number;
    vencido: number;
    proximos_vencimentos: IProximoVencimentoCashback[];
}

export interface IFidelidadeResumoItem {
    empresa_nome: string;
    timezone: string;
    tipo_gatilho: "qtd_pedidos" | "valor_acumulado";
    valor_gatilho: number;
    tipo_recompensa: TipoRecompensaFidelidade;
    valor_recompensa: number;
    contador_atual: number;
    valor_acumulado: number;
    percentual: number;
    recompensa_disponivel: boolean;
    recompensa_expira_em: string | null;
}
