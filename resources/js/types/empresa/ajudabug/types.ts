export type TLabel = {
    name: string;
    color: string;
};

export type TIssue = {
    id: number;
    numero: number;
    titulo: string;
    estado: "open" | "closed";
    estado_motivo: string | null;
    link: string;
    criado_em: string;
    comentarios: number;
    labels: TLabel[];
    labels_nomes: string[];
};

export type TGrupoStatus = "aguardando" | "em_desenvolvimento" | "finalizado" | "outros";

export type TGruposIssues = Record<TGrupoStatus, TIssue[]>;

export type TStatsBug = {
    total: number;
    abertas: number;
    fechadas: number;
    aguardando: number;
    em_desenvolvimento: number;
    finalizado: number;
    sem_label: number;
};
