export interface ICardapio {
  id: number,
  tipo_importacao?: string,
  empresa_id: number,
  nome: string,
  descricao: string,
  dias_funcionamento: Array<string | number>
  tipo_funcionamento: string
}