export type TipoRecompensaFidelidade =
    | "item_gratis"
    | "frete_gratis"
    | "desconto_percentual"
    | "desconto_fixo";

export interface IProgressoFidelidade {
    atual: number;
    meta: number;
    tipo_gatilho: "qtd_pedidos" | "valor_acumulado";
}

export interface IRecompensaFidelidade {
    tipo: TipoRecompensaFidelidade;
    valor: number | null;
    expira_em: string | null;
    base_calculo_desconto: "subtotal_itens" | "total_pedido" | null;
}

export interface IItemPremioDisponivel {
    id: number;
    nome: string;
    preco: number | null;
    imagem: string | null;
    tipo: "I" | "P" | "C";
    total_pedidos: number;
}

export interface IResgateFidelidade {
    usar: boolean;
    item_id?: number;
    tipo?: "I" | "P" | "C";
    complementos?: unknown[];
    pizza_config?: Record<string, unknown>;
    combo_config?: Record<string, unknown>;
}
