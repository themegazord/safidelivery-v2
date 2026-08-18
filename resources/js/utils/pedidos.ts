import { IPedido, TStatusPedido } from "@/types/empresa/pedidos/types";

export const TRANSICOES_VALIDAS: Record<TStatusPedido, TStatusPedido[]> = {
    aguardando_item_premio: ["pendente", "cancelado"],
    pendente: ["aceito", "cancelado", "aguardando pagamento", "sendo preparado"],
    "aguardando pagamento": ["pendente", "cancelado"],
    aceito: ["sendo preparado", "cancelado"],
    "sendo preparado": ["pronto para entrega", "pronto para retirada", "cancelado"],
    "pronto para entrega": ["sendo entregue", "entregue", "cancelado"],
    "pronto para retirada": ["entregue", "cancelado"],
    "sendo entregue": ["entregue", "cancelado"],
    "entregue para mesa": ["entregue"],
    "pedido feito": ["entregue"],
    entregue: [],
    retirado: [],
    cancelado: [],
};

export function transicaoValida(statusAtual: TStatusPedido, novoStatus: TStatusPedido): boolean {
    return (TRANSICOES_VALIDAS[statusAtual] ?? []).includes(novoStatus);
}

export function proximoStatus(pedido: Pick<IPedido, "status" | "pedido_ifood_id" | "dados_retirada_pedido">): TStatusPedido {
    switch (pedido.status) {
        case "pendente":
            return "sendo preparado";
        case "sendo preparado":
            return pedido.dados_retirada_pedido ? "pronto para retirada" : "pronto para entrega";
        case "pedido feito":
        case "sendo entregue":
            return "entregue";
        case "pronto para entrega":
            return pedido.pedido_ifood_id !== null ? "sendo entregue" : "entregue";
        case "pronto para retirada":
            return "entregue";
        case "entregue":
            return "retirado";
        default:
            return pedido.status;
    }
}

const STATUS_LABEL: Record<TStatusPedido, string> = {
    aguardando_item_premio: "Aguardando seleção do item grátis",
    pendente: "Pedido pendente",
    "aguardando pagamento": "Esperando a confirmação do Pix",
    aceito: "Pedido aceito",
    "sendo preparado": "Pedido está sendo preparado",
    "pronto para entrega": "Esperando entregador",
    "pronto para retirada": "Pronto para retirada",
    "sendo entregue": "Pedido está sendo entregue",
    "entregue para mesa": "Pedido entregue na mesa",
    "pedido feito": "Pedido feito",
    entregue: "Pedido entregue",
    retirado: "Pedido retirado",
    cancelado: "Pedido cancelado",
};

export function statusLabel(status: TStatusPedido): string {
    return STATUS_LABEL[status] ?? status;
}

export function mascaraCpfCnpj(valor?: string | null): string | null {
    if (!valor) return null;
    const digitos = valor.replace(/\D+/g, "");
    if (!digitos) return null;

    if (digitos.length === 11) {
        return digitos.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    }
    if (digitos.length === 14) {
        return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    }
    return digitos;
}

export function formatarTelefone(valor?: string | null): string {
    if (!valor) return "";
    return valor.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
}

export function formatarHora(iso: string, timezone: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(iso));
}

export function formatarData(iso: string, timezone: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: timezone,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(iso));
}

export function formatarDataHora(iso: string, timezone: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: timezone,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(iso));
}
