interface IStatusClienteConfig {
    label: string;
    className: string;
}

const STATUS_CLIENTE_CONFIG: Record<string, IStatusClienteConfig> = {
    pendente: { label: "Pedido pendente", className: "bg-amber-500 text-white" },
    "aguardando pagamento": { label: "Esperando confirmação do Pix", className: "bg-amber-500 text-white" },
    aceito: { label: "Pedido aceito", className: "bg-emerald-600 text-white" },
    "sendo preparado": { label: "Sendo preparado", className: "bg-sky-500 text-white" },
    "pronto para entrega": { label: "Esperando entregador", className: "bg-cyan-500 text-white" },
    "pronto para retirada": { label: "Pronto para retirada", className: "bg-cyan-500 text-white" },
    "sendo entregue": { label: "Saiu para entrega", className: "bg-violet-500 text-white" },
    "entregue para mesa": { label: "Entregue na mesa", className: "bg-emerald-600 text-white" },
    "pedido feito": { label: "Pedido feito", className: "bg-emerald-600 text-white" },
    entregue: { label: "Entregue", className: "bg-emerald-600 text-white" },
    retirado: { label: "Retirado", className: "bg-emerald-600 text-white" },
    finalizado: { label: "Finalizado", className: "bg-emerald-600 text-white" },
    cancelado: { label: "Cancelado", className: "bg-destructive text-white" },
    aguardando_item_premio: { label: "Aguardando seleção do prêmio", className: "bg-amber-500 text-white" },
};

export function statusClienteConfig(status: string): IStatusClienteConfig {
    return STATUS_CLIENTE_CONFIG[status] ?? { label: status, className: "bg-muted text-foreground" };
}

export function diasParaVencer(dataVencimento: string): number {
    return Math.ceil((new Date(dataVencimento).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
