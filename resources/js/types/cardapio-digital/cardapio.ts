export type DiaFuncionamento =
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6";

export type TipoFuncionamento = "mesa" | "delivery" | "retirada" | string;

export type TipoCategoria = "I" | "P";

export type Preco = string | number | null;

export interface ICardapio {
    id: number;
    nome: string;
    descricao: string;
    dias_funcionamento: DiaFuncionamento[];
    tipo_funcionamento: TipoFuncionamento;
    categorias: ICategoria[];
}

export interface ICategoria {
    id: number;
    cardapio_id: number;
    tipo: TipoCategoria;
    nome: string;
    dias_funcionamento: DiaFuncionamento[];

    itens: IItem[];
    combos: ICombo[];
    tamanhos: ITamanhoPizza[];
}

export interface IItem {
    id: number;
    categoria_id: number;

    nome: string;
    descricao: string | null;

    preco: Preco;
    desconto: number;
    valor_desconto: Preco;

    imagem: string | null;

    peso: string | null;
    qtde_pessoas: number | null;

    classificacao: string[];
    dias_funcionamento: DiaFuncionamento[];

    grupo_complemento: IGrupoComplemento[];
}

export interface IGrupoComplemento {
    id: number;
    item_id: number;

    nome: string;
    qtd_maxima: number;
    obrigatoriedade: number;

    complementos: IComplemento[];
}

export interface IComplemento {
    id: number;
    grupo_id: number;

    nome: string;
    preco: string | number;
}

export interface ICombo {
    id: number;
    categoria_id: number;

    nome: string;
    descricao: string | null;

    preco: string | number;
    imagem: string | null;

    dias_funcionamento: DiaFuncionamento[];
}

export interface ITamanhoPizza {
    id: number;
    categoria_id: number;

    nome: string;
    qtde_pedacos: number;
    qtde_sabores: number[];

    precos_por_tamanho: IPrecoPorTamanho[];
}

export interface IPrecoPorTamanho {
    id: number;
    tamanho_id: number;
    item_id: number;

    preco: number;
    status: number;

    dias_funcionamento: DiaFuncionamento[];

    item: IPizzaItemResumo | null;
}

export interface IPizzaItemResumo {
    id: number;
    nome: string;
    imagem: string | null;
}
