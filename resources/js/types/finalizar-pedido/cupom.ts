export interface ICupomAplicado {
    id: number;
    nome_cupom: string;
    tipo_cupom: "reais" | "porcentagem";
    onde_afetara: "produto" | "frete";
    valor_desconto: number;
    valor_maximo_desconto: number;
    valor_desconto_calculado: number;
}

export interface ICupomVisivel {
    nome_cupom: string;
    tipo_cupom: "reais" | "porcentagem";
    onde_afetara: "produto" | "frete";
    valor_desconto: number;
}
