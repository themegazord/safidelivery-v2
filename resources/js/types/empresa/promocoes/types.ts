export type OndeAfetara = "produto" | "frete";
export type TipoCupom = "reais" | "porcentagem";
export type QtdeClientesUsabilidade = "ilimitado" | "limitado";
export type StatusPromocao = "ativo" | "inativo";

export interface IPromocaoFormData {
    nome_cupom: string;
    descricao_cupom: string;
    valido_cliente_novo: boolean;
    onde_afetara: OndeAfetara;
    tipo_cupom: TipoCupom;
    valor_desconto: number;
    valor_minimo_pedido: number;
    valor_maximo_desconto: number;
    qtde_clientes_usabilidade: QtdeClientesUsabilidade;
    qtde_clientes: number;
    qtde_usos: number;
    uso_unico: boolean;
    data_vencimento: string;
    dias_disponiveis: number[];
    cupom_visivel: boolean;
    status: StatusPromocao;
}

export interface IPromocao
    extends Omit<IPromocaoFormData, "dias_disponiveis" | "status"> {
    id: number;
    empresa_id: number;
    dias_disponiveis: string;
    status: boolean;
    pedidos_que_foram_usados_cupom_count: number;
    created_at: string;
    deleted_at: string | null;
}

export interface IPaginacao<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface IFiltrosPromocoes {
    tipo_cupom?: TipoCupom | "";
    onde_afetara?: OndeAfetara | "";
    validade?: "<" | ">=" | "";
    nome_cupom?: string;
    status?: "1" | "0" | "";
}

export interface IEstatisticasPromocoes {
    total: number;
    ativos: number;
    expirados: number;
    total_usos: number;
}

export const DIAS_SEMANA = [
    { id: 0, nome: "Domingo", abreviacao: "Dom" },
    { id: 1, nome: "Segunda-feira", abreviacao: "Seg" },
    { id: 2, nome: "Terça-feira", abreviacao: "Ter" },
    { id: 3, nome: "Quarta-feira", abreviacao: "Qua" },
    { id: 4, nome: "Quinta-feira", abreviacao: "Qui" },
    { id: 5, nome: "Sexta-feira", abreviacao: "Sex" },
    { id: 6, nome: "Sábado", abreviacao: "Sáb" },
];

export const PROMOCAO_FORM_PADRAO: IPromocaoFormData = {
    nome_cupom: "",
    descricao_cupom: "",
    valido_cliente_novo: false,
    onde_afetara: "produto",
    tipo_cupom: "reais",
    valor_desconto: 0,
    valor_minimo_pedido: 0,
    valor_maximo_desconto: 0,
    qtde_clientes_usabilidade: "ilimitado",
    qtde_clientes: 1,
    qtde_usos: 1,
    uso_unico: false,
    data_vencimento: new Date().toISOString().slice(0, 10),
    dias_disponiveis: [0, 1, 2, 3, 4, 5, 6],
    cupom_visivel: false,
    status: "ativo",
};
