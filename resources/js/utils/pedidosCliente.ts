interface IStatusClienteConfig {
    label: string;
    variant:
        "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
    className: string;
}

const STATUS_CLIENTE_CONFIG: Record<string, IStatusClienteConfig> = {
    pendente: {
        label: "Pedido pendente",
        variant: "secondary",
        className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    },
    "aguardando pagamento": {
        label: "Esperando confirmação do Pix",
        variant: "secondary",
        className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    },
    aceito: {
        label: "Pedido aceito",
        variant: "default",
        className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    },
    "sendo preparado": {
        label: "Sendo preparado",
        variant: "default",
        className: "bg-sky-500/10 text-sky-700 border-sky-500/20",
    },
    "pronto para entrega": {
        label: "Esperando entregador",
        variant: "default",
        className: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
    },
    "pronto para retirada": {
        label: "Pronto para retirada",
        variant: "default",
        className: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
    },
    "sendo entregue": {
        label: "Saiu para entrega",
        variant: "outline",
        className: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    },
    "entregue para mesa": {
        label: "Entregue na mesa",
        variant: "default",
        className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    },
    "pedido feito": {
        label: "Pedido feito",
        variant: "default",
        className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    },
    entregue: {
        label: "Entregue",
        variant: "default",
        className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    },
    retirado: {
        label: "Retirado",
        variant: "default",
        className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    },
    finalizado: {
        label: "Finalizado",
        variant: "default",
        className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    },
    cancelado: {
        label: "Cancelado",
        variant: "destructive",
        className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    aguardando_item_premio: {
        label: "Aguardando seleção do prêmio",
        variant: "secondary",
        className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    },
};

export function statusClienteConfig(status: string): IStatusClienteConfig {
    return (
        STATUS_CLIENTE_CONFIG[status] ?? {
            label: status,
            variant: "secondary",
            className: "bg-muted text-muted-foreground border-border",
        }
    );
}

export function diasParaVencer(dataVencimento: string): number {
    const vencimento = new Date(dataVencimento);
    if (Number.isNaN(vencimento.getTime())) return 0;
    return Math.ceil(
        (vencimento.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
}
