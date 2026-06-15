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

export interface IItemCombo {
    id: number
    nome: string
    descricao?: string
    imagem?: string
    tipo_preco: 'preco_combo' | 'preco_itens'
    preco_fixo: number
    quantidade: number
    preco_unitario: number
    grupos: IGrupoItensCombo[]
    grupos_complemento: Record<string, IGrupoComplementoCombo>
    observacao: string
    total: number
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

interface IGrupoItensCombo {
    id: number
    nome: string
    obrigatorio: boolean
    qtd_minima: number
    qtd_maxima: number
    quantidade_selecionada: number
    bloqueado: boolean
    itens: IItensGrupoItensCombo[]
}

interface IItensGrupoItensCombo {
    referencia_id: number
    nome: string
    preco: number
    quantidade: number
}

interface IGrupoComplementoCombo {
    id: number
    nome: string
    obrigatorio: boolean
    qtd_maxima: number
    qtd_minima: number
    quantidade_selecionada: number
    bloqueado: boolean
    complementos: Record<string, IComplementoCombo>
}

interface IComplementoCombo {
    referencia_id: number
    nome: string
    preco: number
    quantidade: number
}

export type TManipulaPedidoItem = (
        alvo: "item" | "complemento" | "sabor" | "itemCombo" | "complementoCombo",
        grupo_idx?: number,
        complemento_idx?: number,
        sabor_idx?: number,
        itemCombo_idx?: number,
        complementoCombo_idx?: number,
    ) => void
