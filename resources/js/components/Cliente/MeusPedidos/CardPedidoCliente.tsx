import { Sparkles, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { IPedidoCliente } from "@/types/cliente/pedidos";
import { converteReal } from "@/utils/utils";
import { formatarDataHora } from "@/utils/pedidos";
import { statusClienteConfig } from "@/utils/pedidosCliente";

interface IProps {
    pedido: IPedidoCliente;
    timezone: string;
}

export default function CardPedidoCliente({ pedido, timezone }: IProps) {
    const status = statusClienteConfig(pedido.status);

    return (
        <Card className="h-fit">
            <CardHeader className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                    <CardTitle>Pedido #{pedido.ifood_display_id ?? pedido.id}</CardTitle>
                    <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                        <span>{formatarDataHora(pedido.created_at, timezone)}</span>
                        {pedido.empresa && (
                            <span className="inline-flex items-center gap-1">
                                <Store className="size-3" />
                                {pedido.empresa.nome_fantasia}
                            </span>
                        )}
                    </p>
                </div>
                <Badge className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                    {status.label}
                </Badge>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 rounded-lg bg-muted px-3 py-2.5">
                    {pedido.itens.map((item) => (
                        <div key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
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
                    <div className="flex items-center justify-between rounded-lg bg-emerald-600/5 px-3 py-2 text-xs">
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
