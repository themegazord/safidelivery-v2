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
