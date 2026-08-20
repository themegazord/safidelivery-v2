export type TTipoFormaPagamento = "PIX" | "DIN" | "CTD" | "CTC" | "VRE";

export type TTipoOpcaoFormaPagamento = {
    id: TTipoFormaPagamento;
    name: string;
};

export type TFormaPagamento = {
    id: number;
    descricao: string;
    tipo: TTipoFormaPagamento;
    codigo_pdv: number | null;
    interno: boolean;
};
