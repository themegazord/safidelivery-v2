export type CashbackTipo = "porcentagem" | "fixo";
export type BaseCalculoPorcentagem = "subtotal" | "subtotal_liquido";
export type TipoFuncionamento = "delivery" | "retirada" | "mesa";

export interface ICashbackConfigData {
    status: boolean;
    cashback_tipo: CashbackTipo | null;
    cashback_porcentagem: number | null;
    base_calculo_porcentagem: BaseCalculoPorcentagem;
    cashback_fixo: number | null;
    dias_validade: number | null;
    tipos_funcionamento: TipoFuncionamento[];
}
