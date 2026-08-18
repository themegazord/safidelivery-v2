import { Sparkles, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { IPedidoCliente } from "@/types/cliente/pedidos";
import { converteReal } from "@/utils/utils";
import { formatarDataHora } from "@/utils/pedidos";
import { statusClienteConfig } from "@/utils/pedidosCliente";
import PixPagamentoCard from "./PixPagamentoCard";

interface IProps {
    pedido: IPedidoCliente;
}

export default function CardPedidoCliente({ pedido }: IProps) {
    const status = statusClienteConfig(pedido.status);

    return (
        <Card className="border-border/60 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="gap-3 border-b pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <CardTitle className="truncate text-sm font-semibold">
                            Pedido #{pedido.ifood_display_id ?? pedido.id}
                        </CardTitle>
                        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                            <span>
                                {formatarDataHora(pedido.created_at, pedido.timezone)}
                            </span>
                            {pedido.empresa && (
                                <span className="inline-flex items-center gap-1">
                                    <span aria-hidden>•</span>
                                    <Store className="size-3.5" />
                                    <span className="truncate">
                                        {pedido.empresa.nome_fantasia}
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>

                    <Badge
                        variant={status.variant}
                        className="shrink-0 whitespace-nowrap"
                    >
                        {status.label}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 pt-4">
                <ul className="flex flex-col gap-1.5 text-sm">
                    {pedido.itens.map((item, idx) => (
                        <li
                            key={idx}
                            className="flex items-start justify-between gap-3"
                        >
                            <span className="text-foreground/90 min-w-0 flex-1 truncate">
                                {item.nome}
                            </span>
                            <span className="text-muted-foreground shrink-0 tabular-nums">
                                x{item.quantidade}
                            </span>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-muted-foreground text-sm">Total</span>
                    <span className="text-base font-semibold tabular-nums">
                        R$ {converteReal(pedido.financeiro?.total ?? 0)}
                    </span>
                </div>

                {pedido.status === "confirmar pix" && pedido.financeiro?.pix && (
                    <PixPagamentoCard pix={pedido.financeiro.pix} />
                )}

                {pedido.cashback && (
                    <div className="bg-primary/5 flex items-center justify-between rounded-lg px-3 py-2">
                        <span className="text-primary inline-flex items-center gap-1.5 text-xs font-medium">
                            <Sparkles className="size-3.5" />
                            Cashback gerado
                        </span>
                        <span className="text-primary text-sm font-semibold tabular-nums">
                            + R$ {converteReal(pedido.cashback.credito_gerado)}
                        </span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="bg-muted/20 text-muted-foreground border-t py-2.5 text-xs">
                {pedido.financeiro?.forma_pagamento_label ??
                    "Forma de pagamento não informada"}
            </CardFooter>
        </Card>
    );
}
