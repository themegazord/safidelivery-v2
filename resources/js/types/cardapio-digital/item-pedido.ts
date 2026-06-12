export interface IItemPizza {
    id: number;
    categoria_id: number;
    nome: string;
    qtde_pedacos: number;
    quantidade_sabores_selecionadas: number;
    quantidade_sabor: number;
    qtde_sabores: number[];
    quantidade: number;
    menorValorTamanho: number;
    observacao: string;
    total: number;
    categoria: { id: number; nome: string };
    massas: IMassa[];
    bordas: IBorda[];
    massaSelecionada?: IMassa;
    bordaSelecionada?: IBorda;
    sabores: ISabor[];
    tipo: "I" | "P";
}

interface IMassa {
    id: number;
    categoria_id: number;
    nome: string;
    preco: number;
}

interface IBorda {
    id: number;
    categoria_id: number;
    nome: string;
    preco: number;
}

interface ISabor {
    id: number;
    item_id: number;
    nome: string;
    preco: number;
    imagem: string;
    descricao: string;
    classificacao: string[];
    quantidade: number;
}

export interface IItemPedido {
    id: number;
    nome: string;
    preco: string;
    desconto: boolean | number;
    valor_desconto: number;
    descricao: string;
    imagem?: string;
    grupo_complemento: IGrupoComplemento[];
    quantidade: number;
    observacao?: string;
    total: number;
    tipo: "I" | "P";
}

export interface IGrupoComplemento {
    id: number;
    item_id: number;
    nome: string;
    obrigatoriedade: boolean | number;
    qtd_minima: number;
    qtd_maxima: number;
    bloqueado: boolean;
    complementos: IComplemento[];
}

interface IComplemento {
    id: number;
    grupo_id: number;
    nome: string;
    descricao: string;
    preco: string;
    status: boolean | number;
    quantidade: number;
}
