export type DiaFuncionamento =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6
  | "0" | "1" | "2" | "3" | "4" | "5" | "6";

export type TipoFuncionamento =
  | "mesa"
  | "delivery"
  | "retirada";

export type TipoCategoria = "I" | "P";

export type Preco = string | number | null;

export type Classificacao =
  | string[]
  | Record<string, string>;

export interface ICardapio {
  id: number;
  tipo_importacao: string | null;
  empresa_id: number;

  nome: string;
  descricao: string;

  dias_funcionamento: DiaFuncionamento[];
  tipo_funcionamento: TipoFuncionamento | string;

  created_at: string;
  updated_at: string;

  categorias: ICategoria[];
}

export interface ICategoria {
  id: number;
  importacao_id: number | null;

  ordem: number | null;

  dias_funcionamento: DiaFuncionamento[];

  cardapio_id: number;

  tipo: TipoCategoria;

  nome: string;

  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  itens: IItem[];
  combos: ICombo[];

  tamanhos: ITamanhoPizza[];
  massas: IMassaPizza[];
  bordas: IBordaPizza[];
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

  classificacao: Classificacao;

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

  preco: string;
  tipo_preco: string;

  imagem: string | null;

  classificacao: IComboClassificacao[];

  dias_funcionamento: DiaFuncionamento[];

  meta: IComboMeta;
}

export interface IComboClassificacao {
  status: boolean;
}

export interface IComboMeta {
  id: number;
  combo_id: number;

  tipo_precificacao: string;

  preco_combo: string | null;
  desconto_combo: string | null;
}

export interface ITamanhoPizza {
  id: number;

  external_id: number;
  categoria_id: number;

  nome: string;

  qtde_pedacos: number;

  qtde_sabores: number[];

  created_at: string;
  updated_at: string;

  precos_por_tamanho: IPrecoPorTamanho[];
}

export interface IPrecoPorTamanho {
  id: number;

  tamanho_id: number;
  item_id: number;

  preco: number;
  status: number;

  dias_funcionamento: DiaFuncionamento[];

  item: IPizzaItemResumo;
}

export interface IPizzaItemResumo {
  id: number;

  nome: string;
  descricao: string | null;

  imagem: string | null;

  classificacao: Classificacao;

  dias_funcionamento: DiaFuncionamento[];
}

export interface IMassaPizza {
  id: number;
  categoria_id: number;

  nome: string;
  preco: number;
}

export interface IBordaPizza {
  id: number;
  categoria_id: number;

  nome: string;
  preco: number;
}