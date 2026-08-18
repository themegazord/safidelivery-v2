import { Sparkles, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { IPedidoCliente } from "@/types/cliente/pedidos";
import { converteReal } from "@/utils/utils";
import { formatarDataHora } from "@/utils/pedidos";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
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

interface IProps {
    pedido: IPedidoCliente;
    timezone: string;
}

export default function CardPedidoCliente({ pedido, timezone }: IProps) {
    const status = STATUS_CONFIG[pedido.status] ?? { label: pedido.status, className: "bg-muted text-foreground" };

    return (
        <Card>
            <CardHeader className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-bold sm:text-base">
                        Pedido #{pedido.ifood_display_id ?? pedido.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatarDataHora(pedido.created_at, timezone)}
                        {pedido.empresa && (
                            <span className="inline-flex items-center gap-1">
                                {" "}
                                <Store className="size-3" /> {pedido.empresa.nome_fantasia}
                            </span>
                        )}
                    </p>
                </div>
                <Badge className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                    {status.label}
                </Badge>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
                <div className="flex flex-col gap-1 rounded-lg bg-muted px-3 py-2">
                    {pedido.itens.map((item) => (
                        <div key={item.id} className="flex items-baseline justify-between gap-2 text-sm">
                            <span className="truncate">{item.nome}</span>
                            <span className="shrink-0 font-medium text-muted-foreground">x{item.quantidade}</span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="text-sm font-bold sm:text-base">
                        R$ {converteReal(pedido.financeiro?.total ?? 0)}
                    </span>
                </div>

                {pedido.cashback && (
                    <div className="flex items-center justify-between rounded-lg bg-emerald-600/5 px-3 py-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-600">
                            <Sparkles className="size-3.5" />
                            <span>Cashback gerado</span>
                        </div>
                        <span className="font-semibold text-emerald-600">
                            + R$ {converteReal(pedido.cashback.credito_gerado)}
                        </span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="text-xs text-muted-foreground">
                {pedido.financeiro?.forma_pagamento_label ?? "Forma de pagamento não informada"}
            </CardFooter>
        </Card>
    );
}
