export type TipoGatilho = "qtd_pedidos" | "valor_acumulado";
export type TipoRecompensa =
    | "item_gratis"
    | "frete_gratis"
    | "desconto_percentual"
    | "desconto_fixo";
export type BaseCalculoDesconto = "subtotal_itens" | "total_pedido";
export type TipoFuncionamento = "delivery" | "retirada" | "mesa";

export interface IFidelidadeConfigData {
    ativo: boolean;
    tipo_gatilho: TipoGatilho | null;
    valor_gatilho: number | null;
    tipo_recompensa: TipoRecompensa | null;
    valor_recompensa: number | null;
    base_calculo_desconto: BaseCalculoDesconto;
    valor_max_premio: number | null;
    categorias_bloqueadas: number[];
    validade_dias: number | null;
    tipos_funcionamento: TipoFuncionamento[];
}

export interface ICategoriaOption {
    value: number;
    label: string;
}
