export const ACAO_NEGOCIACAO_LABEL: Record<string, string> = {
    CANCELLATION: "Cancelamento total",
    PARTIAL_CANCELLATION: "Cancelamento parcial",
    PROPOSED_AMOUNT_REFUND: "Cancelamento com proposta de reembolso",
};

export const TIPO_NEGOCIACAO_LABEL: Record<string, string> = {
    AFTER_DELIVERY: "Solicitação de cancelamento após a entrega",
    DELAY: "Solicitação de cancelamento por atraso na entrega",
    PREPARATION_TIME: "Solicitação de cancelamento durante o preparo",
    AFTER_DELIVERY_PARTIALLY: "Solicitação de cancelamento parcial após a entrega",
};

export const RAZAO_NEGOCIACAO_LABEL: Record<string, string> = {
    HIGH_STORE_DEMAND: "Alta demanda na loja.",
    STORE_SYSTEM_ISSUES: "Problemas no sistema da loja.",
    LACK_OF_DRIVERS: "Falta de entregadores.",
    OPERATIONAL_ISSUES: "Problemas operacionais.",
    ORDER_OUT_FOR_DELIVERY: "Pedido saiu para entrega.",
    DRIVER_IS_ALREADY_AT_THE_ADDRESS: "Entregador já está no endereço.",
    STORE_INTERNAL_DIFFICULTIES: "Problemas internos da loja.",
    OTHER_REASONS: "Outros motivos.",
};

export const STATUS_SETTLEMENT_LABEL: Record<string, { label: string; className: string }> = {
    EXPIRED: { label: "Tempo expirado", className: "text-destructive" },
    ACCEPTED: { label: "Negociação aceita", className: "text-primary" },
    REJECTED: { label: "Negociação rejeitada", className: "text-destructive" },
    ALTERNATIVE_REPLIED: { label: "Negociação respondida", className: "text-sky-600 dark:text-sky-400" },
};
