export type TCoordenada = {
    lat: number;
    lng: number;
};

export type TTaxaEntrega = {
    id?: number;
    tipo: "raio" | "poligono";
    raio: number;
    tempo: number;
    taxa: number;
    corCirculo: string;
    corPreenchimento: string;
    coordenadas: TCoordenada[] | null;
};

export type TConfiguracoesGeraisEntrega = {
    taxa_fixa: number | null;
    valor_minimo_pedido: number | null;
    frete_gratis_acima: number | null;
    prioridade_zona_sobreposicao: "poligono" | "raio";
};

export type TEmpresaCoordenadas = {
    nome_fantasia: string;
    latitude: number | null;
    longitude: number | null;
};
