export interface ICardapio {
  id: number,
  tipo_importacao?: string,
  empresa_id: number,
  nome: string,
  descricao: string,
  dias_funcionamento: Array<string | number>
  tipo_funcionamento: string
}

export interface ICategoriaTamanho {
  id: number,
  external_id: string | null,
  categoria_id: number,
  nome: string,
  qtde_pedacos: number | null,
  qtde_sabores: Array<string | number> | null,
}

export interface ICategoriaMassa {
  id: number,
  external_id: string | null,
  categoria_id: number,
  nome: string,
  preco: number,
}

export interface ICategoriaBorda {
  id: number,
  external_id: string | null,
  categoria_id: number,
  nome: string,
  preco: number,
}

export interface ICategoria {
  id: number,
  importacao_id: string | null,
  ordem: number | null,
  dias_funcionamento: Array<string | number> | null,
  cardapio_id: number,
  tipo: string,
  nome: string,
  deleted_at: string | null,
  itens_count: number,
  tamanhos: ICategoriaTamanho[],
  massas: ICategoriaMassa[],
  bordas: ICategoriaBorda[],
}

export interface ICategoriaStatus {
  id: number,
  inativo: boolean,
}