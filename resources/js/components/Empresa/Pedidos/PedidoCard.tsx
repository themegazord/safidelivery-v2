import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { IPedido } from "@/types/empresa/pedidos/types";
import { converteReal } from "@/utils/utils";
import { formatarHora, formatarTelefone } from "@/utils/pedidos";
import { ArrowRight, CalendarDays, MapPin, Star } from "lucide-react";
import TipoPedidoIcon from "./TipoPedidoIcon";

const FIDELIDADE_LABEL: Record<string, (pedido: IPedido) => string> = {
    item_gratis: () => "Item grátis",
    frete_gratis: () => "Frete grátis",
    desconto_percentual: (p) =>
        `${Number(p.fidelidade_percentual ?? 0).toFixed(0)}% de desconto (- ${converteReal(p.fidelidade_desconto ?? 0)})`,
    desconto_fixo: (p) => `R$ ${converteReal(p.fidelidade_desconto ?? 0)} de desconto`,
};

interface IProps {
    pedido: IPedido;
    timezone: string;
    avancando: boolean;
    onAbrirDetalhes: (pedidoId: number) => void;
    onAvancar: (pedido: IPedido) => void;
}

export default function PedidoCard({ pedido, timezone, avancando, onAbrirDetalhes, onAvancar }: IProps) {
    const ehIfood = pedido.pedido_ifood_id !== null;
    const nome = pedido.cliente?.nome ?? pedido.nome ?? "";
    const telefone = pedido.cliente?.telefone ?? pedido.telefone ?? "";
    const comandaValida = pedido.comanda && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pedido.comanda);
    const endereco = ehIfood ? pedido.endereco_entrega_ifood : pedido.endereco_entrega;

    return (
        <button
            type="button"
            onClick={() => onAbrirDetalhes(pedido.id)}
            className="w-full cursor-pointer rounded-xl bg-card p-4 text-left shadow-sm hover:shadow-md md:p-5"
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {pedido.tipo === "D" && (
                        <Badge className={ehIfood ? "gap-1 bg-amber-500 text-white" : "gap-1 bg-emerald-600 text-white"}>
                            <TipoPedidoIcon tipo="D" ehIfood={ehIfood} className="h-3 w-3" />
                            {ehIfood ? "iFood" : "Delivery"}
                        </Badge>
                    )}
                    {pedido.tipo === "M" && (
                        <Badge className="gap-1 bg-sky-600 text-white">
                            <TipoPedidoIcon tipo="M" ehIfood={false} className="h-3 w-3" />
                            Mesa
                        </Badge>
                    )}
                    {pedido.tipo === "R" && (
                        <Badge className="gap-1 bg-violet-600 text-white">
                            <TipoPedidoIcon tipo="R" ehIfood={false} className="h-3 w-3" />
                            Retirada
                        </Badge>
                    )}
                    <h2 className="text-base font-bold md:text-lg">
                        Pedido #{pedido.ifood_display_id ?? pedido.id}
                    </h2>
                    {pedido.prioridade && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger render={<span />}>
                                    <Star className="h-5 w-5 fill-blue-500 text-blue-500" />
                                </TooltipTrigger>
                                <TooltipContent>Prioridade</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {pedido.fidelidade_recompensa_aplicada && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger
                                    render={
                                        <Badge className="gap-1 bg-purple-600 text-white">
                                            <Star className="h-3 w-3" />
                                            Fidelidade
                                        </Badge>
                                    }
                                />
                                <TooltipContent>
                                    {FIDELIDADE_LABEL[pedido.fidelidade_recompensa_aplicada]?.(pedido) ?? "Recompensa aplicada"}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {pedido.eh_agendado && ehIfood && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger
                                    render={
                                        <Badge className="gap-1 bg-purple-600 text-white">
                                            <CalendarDays className="h-3 w-3" />
                                            Agendado
                                        </Badge>
                                    }
                                />
                                <TooltipContent>
                                    Entrega agendada
                                    {pedido.data_agendamento_inicio && pedido.data_agendamento_fim && (
                                        <>
                                            {" "}
                                            — {formatarHora(pedido.data_agendamento_inicio, timezone)} a{" "}
                                            {formatarHora(pedido.data_agendamento_fim, timezone)}
                                        </>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <span className="flex items-center gap-1 rounded-lg bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700 md:text-sm dark:bg-sky-950 dark:text-sky-300">
                    {formatarHora(pedido.created_at, timezone)}
                </span>
            </div>

            <div className="my-3 border-t" />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{nome}</p>
                    <p className="text-xs text-muted-foreground">{formatarTelefone(telefone)}</p>
                </div>
                <div className="min-w-0 sm:text-right">
                    <p className="text-base font-bold">{converteReal(pedido.financeiro?.total ?? 0)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                        {!ehIfood ? pedido.financeiro?.forma_pagamento_label : pedido.financeiro?.forma_pagamento}
                    </p>
                </div>
            </div>

            {pedido.tipo === "M" ? (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Mesa: {pedido.mesa}
                    </span>
                    {comandaValida && <span>Comanda: {pedido.comanda}</span>}
                </div>
            ) : (
                <>
                    <div className="mt-3 flex items-start gap-1 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        {pedido.dados_retirada_pedido ? (
                            <span>Pedido marcado para retirada</span>
                        ) : (
                            <span className="truncate">
                                {endereco ? `${endereco.logradouro}, ${endereco.numero}` : "—"}
                            </span>
                        )}
                    </div>
                    {pedido.codigo_coleta && (
                        <p className="mt-2 text-sm font-bold text-primary">Código de coleta: {pedido.codigo_coleta}</p>
                    )}
                </>
            )}

            <div className="mt-4">
                <Button
                    className="w-full bg-emerald-600 py-2 text-sm text-white hover:bg-emerald-700 md:text-base"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAvancar(pedido);
                    }}
                    disabled={avancando}
                >
                    {avancando ? <Spinner className="h-4 w-4" /> : "Avançar pedido"}
                    <ArrowRight />
                </Button>
            </div>
        </button>
    );
}
