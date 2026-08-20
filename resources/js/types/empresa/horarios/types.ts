export type TDiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type TTipoFuncionamento = "delivery" | "retirada" | "mesa";

export type TFuncionamentoEstabelecimento = "sempre" | "fechado" | "horarios";

export type THorarioFuncionamento = {
    id?: number;
    dia_semana: TDiaSemana;
    hora_inicio: string;
    hora_fim: string;
    status: boolean;
};

export type THorariosPorTipo = Record<TTipoFuncionamento, THorarioFuncionamento[]>;

export type TFusoHorario = {
    id: number;
    name: string;
};

export type TIndisponibilidade = {
    id: number;
    titulo: string;
    descricao: string | null;
    data_inicio: string;
    data_fim: string;
};
