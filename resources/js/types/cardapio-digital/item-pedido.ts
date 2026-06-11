export interface IItemPedido {
    id: number
    nome: string
    preco: string
    desconto: boolean | number
    valor_desconto: number
    descricao: string
    imagem?: string
    grupo_complemento: IGrupoComplemento[]
    quantidade: number
    observacao?: string,
    total: number,
    tipo: 'I' | 'P'
}


export interface IGrupoComplemento {
    id: number
    item_id: number
    nome: string
    obrigatoriedade: boolean | number
    qtd_minima: number
    qtd_maxima: number
    bloqueado: boolean
    complementos: IComplemento[]
}

interface IComplemento {
    id: number
    grupo_id: number
    nome: string
    descricao: string
    preco: string
    status: boolean | number
    quantidade: number
}
