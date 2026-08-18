import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { IPedido, IPedidoItem } from "@/types/empresa/pedidos/types";
import { converteReal } from "@/utils/utils";
import { formatarDataHora, formatarHora, mascaraCpfCnpj, statusLabel } from "@/utils/pedidos";
import {
    ArrowUpRight,
    CalendarDays,
    Clock,
    MapPin,
    MessageCircle,
    Percent,
    Printer,
    QrCode,
    RotateCcw,
    Sparkles,
    Star,
    Trash2,
    User,
    Wallet,
} from "lucide-react";
import TipoPedidoIcon from "./TipoPedidoIcon";

const FIDELIDADE_LABEL: Record<string, (pedido: IPedido) => string> = {
    item_gratis: () => "Item grátis",
    frete_gratis: () => "Frete grátis",
    desconto_percentual: (p) =>
        `${Number(p.fidelidade_percentual ?? 0).toFixed(0)}% de desconto (- ${converteReal(p.fidelidade_desconto ?? 0)})`,
    desconto_fixo: (p) => `Desconto fixo de ${converteReal(p.fidelidade_desconto ?? 0)}`,
};

function ItemPedidoLinha({ item }: { item: IPedidoItem }) {
    if (item.tipo === "I") {
        return (
            <div className="border-b py-2 text-sm last:border-b-0">
                <div className="flex justify-between">
                    <p className="font-bold">{item.quantidade}x {item.nome}</p>
                    {!item.item_premio && <p className="font-light">{converteReal(item.quantidade * item.preco_unitario)}</p>}
                </div>
                {item.complementos.map((c, idx) => (
                    <div key={idx} className="flex justify-between pl-8">
                        <p>{c.qtde}x {c.nome}</p>
                        {!item.item_premio && <p className="font-light">{converteReal(c.preco_unitario * c.qtde)}</p>}
                    </div>
                ))}
                {item.observacao && <p className="mt-1 text-xs italic">Observação: {item.observacao}</p>}
                <div className="mt-1 flex justify-between font-bold">
                    <p>Subtotal</p>
                    <p>{converteReal(item.item_premio ? 0 : item.subtotal)}</p>
                </div>
            </div>
        );
    }

    if (item.tipo === "P") {
        return (
            <div className="border-b py-2 text-sm last:border-b-0">
                <p className="font-bold">{item.quantidade}x {item.nome}</p>
                {item.borda && (
                    <div className="flex justify-between">
                        <p className="font-bold">Borda: {item.borda.nome}</p>
                        {!item.item_premio && <p className="font-light">{converteReal(item.borda.preco)}</p>}
                    </div>
                )}
                {item.massa && (
                    <div className="flex justify-between">
                        <p className="font-bold">Massa: {item.massa.nome}</p>
                        {!item.item_premio && <p className="font-light">{converteReal(item.massa.preco)}</p>}
                    </div>
                )}
                {item.sabores.map((s, idx) => (
                    <div key={idx} className="flex justify-between pl-8">
                        <p>{s.qtde}x {s.nome}</p>
                        {!item.item_premio && <p className="font-light">{converteReal(s.preco_unitario * s.qtde)}</p>}
                    </div>
                ))}
                {item.observacao && <p className="mt-1 text-xs italic">Observação: {item.observacao}</p>}
                <div className="mt-1 flex justify-between font-bold">
                    <p>Subtotal</p>
                    <p>{converteReal(item.item_premio ? 0 : item.subtotal)}</p>
                </div>
            </div>
        );
    }

    const mostraPrecoItemCombo = !item.item_premio && (item.tipo_preco ?? "preco_combo") === "preco_itens";
    const grupos = item.combo_itens.reduce<Record<string, typeof item.combo_itens>>((acc, ci) => {
        (acc[ci.grupo_nome] ??= []).push(ci);
        return acc;
    }, {});

    return (
        <div className="border-b py-2 text-sm last:border-b-0">
            <div className="flex justify-between">
                <p className="font-bold">{item.quantidade}x {item.nome}</p>
                <p className="font-light">{converteReal(item.quantidade * item.preco_unitario)}</p>
            </div>
            {Object.entries(grupos).map(([grupoNome, itensGrupo]) => (
                <div key={grupoNome} className="pl-4">
                    <p className="text-xs font-semibold text-muted-foreground">{grupoNome}</p>
                    {itensGrupo.map((ci, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between pl-4">
                                <p>{ci.qtde}x {ci.item_nome}</p>
                                {((ci.tipo === "complemento" && ci.preco_unitario > 0) || (mostraPrecoItemCombo && ci.tipo === "item" && ci.preco_unitario > 0)) && (
                                    <p className="font-light">+ {converteReal(ci.preco_unitario * ci.qtde)}</p>
                                )}
                            </div>
                            {ci.customizacoes.map((cu, cuIdx) => (
                                <div key={cuIdx} className="flex justify-between pl-8 text-xs text-muted-foreground">
                                    <p>{cu.qtde}x {cu.nome}</p>
                                    {cu.preco_unitario > 0 && <p className="font-light">+ {converteReal(cu.preco_unitario * cu.qtde)}</p>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
            {item.observacao && <p className="mt-1 text-xs italic">Observação: {item.observacao}</p>}
            <div className="mt-1 flex justify-between font-bold">
                <p>Subtotal</p>
                <p>{converteReal(item.subtotal)}</p>
            </div>
        </div>
    );
}

interface IProps {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    pedido: IPedido | undefined;
    loading: boolean;
    timezone: string;
    variante: "atual" | "passado";
    onCancelar?: () => void;
    onImprimir?: (pedidoId: number) => void;
    onVerCliente?: () => void;
    podeVerCliente?: boolean;
}

export default function PedidoDetalhesDialog({
    open,
    onOpenChange,
    pedido,
    loading,
    timezone,
    variante,
    onCancelar,
    onImprimir,
    onVerCliente,
    podeVerCliente,
}: IProps) {
    const ehIfood = pedido?.pedido_ifood_id !== null && pedido?.pedido_ifood_id !== undefined;

    const subtotalItens = pedido?.financeiro
        ? ehIfood
            ? pedido.financeiro.subtotal_itens_ifood ?? 0
            : pedido.financeiro.subtotal_itens ?? pedido.financeiro.total - pedido.valor_frete
        : 0;

    const temDesconto = Boolean(
        pedido?.cupom_usado_no_pedido ||
        (pedido?.cupons_usado_no_ifood?.length ?? 0) > 0 ||
        (pedido?.financeiro?.cashback_utilizado ?? 0) > 0 ||
        (pedido?.fidelidade_desconto ?? 0) > 0,
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] w-full max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-3xl lg:max-w-5xl">
                {loading || !pedido ? (
                    <div className="flex h-60 flex-col items-center justify-center gap-2">
                        <Spinner className="h-8 w-8" />
                        <p className="text-muted-foreground">Carregando pedido...</p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="flex flex-wrap items-center justify-between gap-4 pr-6">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="rounded bg-muted p-2">
                                        <TipoPedidoIcon tipo={pedido.tipo} ehIfood={ehIfood} className="h-5 w-5" />
                                    </div>
                                    <DialogTitle className="text-xl md:text-2xl">
                                        Pedido #{pedido.ifood_display_id ?? pedido.id}
                                    </DialogTitle>
                                    <Badge className="rounded-lg bg-primary px-2 py-1 text-sm text-primary-foreground">
                                        {statusLabel(pedido.status)}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1 rounded bg-sky-100 px-2 py-2 text-sm text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                                        <Clock className="h-4 w-4" />
                                        {formatarHora(pedido.created_at, timezone)}
                                    </span>
                                    {variante === "atual" && onCancelar && (
                                        <Button variant="outline" className="text-destructive" onClick={onCancelar}>
                                            <Trash2 />
                                        </Button>
                                    )}
                                    {onImprimir && (
                                        <Button variant="outline" onClick={() => onImprimir(pedido.id)}>
                                            <Printer />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="flex flex-col gap-4">
                                <div className="relative flex gap-2">
                                    {variante === "atual" && onVerCliente && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="absolute right-0 top-0"
                                            onClick={onVerCliente}
                                            disabled={!podeVerCliente}
                                        >
                                            <ArrowUpRight />
                                        </Button>
                                    )}
                                    <div className="flex items-center rounded bg-muted p-2">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col gap-1 text-sm md:text-base">
                                        <p className="font-bold">Cliente</p>
                                        <p>{pedido.cliente?.nome ?? pedido.nome}</p>
                                        <a href={`tel:${pedido.cliente?.telefone ?? pedido.telefone}`} className="text-blue-500 underline">
                                            {pedido.cliente?.telefone ?? pedido.telefone}
                                        </a>
                                        <p>CPF/CNPJ: {mascaraCpfCnpj(pedido.cliente?.cpf_cnpj ?? pedido.cpf_cnpj_ifood) ?? "—"}</p>
                                    </div>
                                </div>

                                {pedido.tipo === "D" && (
                                    pedido.dados_retirada_pedido ? (
                                        <div className="flex gap-2">
                                            <div className="flex items-center rounded bg-muted p-2">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col gap-1 text-sm md:text-base">
                                                <p className="font-bold">Dados da pessoa que vai retirar o pedido</p>
                                                <p>{pedido.cliente?.nome ?? pedido.nome}, {pedido.cliente?.telefone ?? pedido.telefone}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <div className="flex items-center rounded bg-muted p-2">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col gap-1 text-sm md:text-base">
                                                <p className="font-bold">Entrega</p>
                                                <p>
                                                    {(ehIfood ? pedido.endereco_entrega_ifood : pedido.endereco_entrega)
                                                        ? `${(ehIfood ? pedido.endereco_entrega_ifood : pedido.endereco_entrega)!.logradouro}, Nº ${(ehIfood ? pedido.endereco_entrega_ifood : pedido.endereco_entrega)!.numero}, ${(ehIfood ? pedido.endereco_entrega_ifood : pedido.endereco_entrega)!.bairro}, ${(ehIfood ? pedido.endereco_entrega_ifood : pedido.endereco_entrega)!.cidade}`
                                                        : "—"}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}

                                {pedido.tipo === "R" && (
                                    <div className="flex gap-2">
                                        <div className="flex items-center rounded bg-muted p-2">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col gap-1 text-sm md:text-base">
                                            <p className="font-bold">Dados da pessoa que vai retirar o pedido</p>
                                            <p>{pedido.cliente?.nome ?? pedido.nome}, {pedido.cliente?.telefone ?? pedido.telefone}</p>
                                        </div>
                                    </div>
                                )}

                                {pedido.tipo === "M" && (
                                    <div className="flex gap-2">
                                        <div className="flex items-center rounded bg-muted p-2">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col gap-1 text-sm md:text-base">
                                            <p className="font-bold">Mesa: {pedido.mesa}</p>
                                            {pedido.comanda && <p className="font-bold">Comanda: {pedido.comanda}</p>}
                                        </div>
                                    </div>
                                )}

                                {variante === "atual" && pedido.eh_agendado && (
                                    <div className="flex gap-2">
                                        <div className="flex items-center rounded bg-purple-100 p-2 dark:bg-purple-950">
                                            <CalendarDays className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                                        </div>
                                        <div className="flex flex-col gap-1 text-sm md:text-base">
                                            <p className="font-bold text-purple-700 dark:text-purple-300">Pedido agendado</p>
                                            {pedido.data_inicio_preparo && (
                                                <p>Início do preparo: <span className="font-semibold">{formatarDataHora(pedido.data_inicio_preparo, timezone)}</span></p>
                                            )}
                                            {pedido.data_agendamento_inicio && (
                                                <p>Entrega a partir de: <span className="font-semibold">{formatarDataHora(pedido.data_agendamento_inicio, timezone)}</span></p>
                                            )}
                                            {pedido.data_agendamento_fim && (
                                                <p>Entrega até: <span className="font-semibold">{formatarDataHora(pedido.data_agendamento_fim, timezone)}</span></p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {variante === "atual" && pedido.codigo_coleta && (
                                    <div className="flex gap-2">
                                        <div className="flex items-center rounded bg-blue-100 p-2 dark:bg-blue-950">
                                            <QrCode className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                        </div>
                                        <div className="flex flex-col gap-1 text-sm md:text-base">
                                            <p className="font-bold text-blue-700 dark:text-blue-300">Código de coleta</p>
                                            <p className="text-xl font-bold tracking-widest">{pedido.codigo_coleta}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <div className="flex items-center rounded bg-muted p-2">
                                        <Wallet className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-lg font-bold">Forma de pagamento</p>
                                        {pedido.financeiro && (pedido.financeiro.pagamentos.length > 0 || pedido.financeiro.forma_pagamento === "multiplo") ? (
                                            pedido.financeiro.pagamentos.map((pag, idx) => (
                                                <p key={idx}>{pag.label}: {converteReal(pag.valor)}</p>
                                            ))
                                        ) : (
                                            <p>{!ehIfood ? pedido.financeiro?.forma_pagamento_label : pedido.financeiro?.forma_pagamento}</p>
                                        )}
                                    </div>
                                </div>

                                {variante === "atual" && pedido.cupom_usado_no_pedido && (
                                    <div className="flex gap-2">
                                        <div className="flex items-center rounded bg-muted p-2">
                                            <Percent className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-lg font-bold">Cupom de desconto</p>
                                            <p>{pedido.cupom_usado_no_pedido.nome_cupom}</p>
                                        </div>
                                    </div>
                                )}

                                {variante === "atual" && pedido.fidelidade_recompensa_aplicada && (
                                    <div className="flex gap-2">
                                        <div className="flex items-center rounded bg-purple-100 p-2 dark:bg-purple-950">
                                            <Star className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">Recompensa de fidelidade</p>
                                            <p>{FIDELIDADE_LABEL[pedido.fidelidade_recompensa_aplicada]?.(pedido) ?? "Recompensa aplicada"}</p>
                                        </div>
                                    </div>
                                )}

                                {variante === "atual" && pedido.observacao && (
                                    <div className="flex gap-2">
                                        <div className="flex items-center rounded bg-muted p-2">
                                            <MessageCircle className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-lg font-bold">Observação do pedido</p>
                                            <p>{pedido.observacao}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="rounded-t bg-muted p-4">
                                    <p className="font-bold">Itens do pedido</p>
                                </div>
                                <div className="mt-2">
                                    {(pedido.itens ?? []).map((item) => <ItemPedidoLinha key={item.id} item={item} />)}
                                </div>

                                <div className="flex justify-between font-bold">
                                    <p>Subtotal dos itens</p>
                                    <p>{converteReal(subtotalItens)}</p>
                                </div>

                                <div className="mt-6 flex flex-col gap-1">
                                    {(pedido.financeiro?.adicional ?? 0) > 0 && (
                                        <div className="flex justify-between font-bold">
                                            <p>Adicional</p>
                                            <p>{converteReal(pedido.financeiro!.adicional!)}</p>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold">
                                        <p>Frete</p>
                                        <p>{converteReal(pedido.valor_frete)}</p>
                                    </div>

                                    {variante === "atual" && temDesconto && (
                                        <div className="mt-2 flex flex-col gap-1 border-t border-dashed pt-2">
                                            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Descontos</p>
                                            {(pedido.fidelidade_desconto ?? 0) > 0 && (
                                                <div className="flex justify-between text-purple-600 dark:text-purple-400">
                                                    <p className="flex items-center gap-1 font-bold">
                                                        <Star className="h-4 w-4" /> Fidelidade ({pedido.fidelidade_percentual}%)
                                                    </p>
                                                    <p className="font-bold">- {converteReal(pedido.fidelidade_desconto!)}</p>
                                                </div>
                                            )}
                                            {pedido.cupom_usado_no_pedido && (
                                                <div className="flex justify-between text-orange-600 dark:text-orange-400">
                                                    <p className="flex items-center gap-1 font-bold">
                                                        <Percent className="h-4 w-4" />
                                                        {pedido.cupom_usado_no_pedido.onde_afetara === "produto" ? "Cupom (produtos)" : "Cupom (frete)"}
                                                    </p>
                                                    <p className="font-bold">- {converteReal(pedido.financeiro?.valor_desconto ?? 0)}</p>
                                                </div>
                                            )}
                                            {pedido.cupons_usado_no_ifood?.map((cupom, idx) => (
                                                <div key={idx} className="flex justify-between text-orange-600 dark:text-orange-400">
                                                    <p className="flex items-center gap-1 font-bold">
                                                        <Percent className="h-4 w-4" />
                                                        {cupom.alvo_desconto_eh_frete ? "Desconto no frete" : "Desconto nos produtos"}
                                                        <span className="text-xs font-normal text-muted-foreground">({cupom.responsavel_desconto_label})</span>
                                                    </p>
                                                    <p className="font-bold">- {converteReal(cupom.valor)}</p>
                                                </div>
                                            ))}
                                            {(pedido.financeiro?.cashback_utilizado ?? 0) > 0 && (
                                                <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                                                    <p className="flex items-center gap-1 font-bold">
                                                        <RotateCcw className="h-4 w-4" /> Cashback utilizado
                                                    </p>
                                                    <p className="font-bold">- {converteReal(pedido.financeiro!.cashback_utilizado!)}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-bold">
                                        <p>Total</p>
                                        <p>{converteReal(pedido.financeiro?.total ?? 0)}</p>
                                    </div>
                                    {pedido.cashback && (
                                        <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                                            <p className="flex items-center gap-1 text-sm">
                                                <Sparkles className="h-4 w-4" /> Cashback gerado
                                            </p>
                                            <p className="text-sm font-semibold">+ {converteReal(pedido.cashback.credito_gerado)}</p>
                                        </div>
                                    )}
                                    {pedido.financeiro?.troco_para && pedido.financeiro.valor_troco && (
                                        <>
                                            <div className="flex justify-between font-bold">
                                                <p>Troco para:</p>
                                                <p>{converteReal(pedido.financeiro.troco_para)}</p>
                                            </div>
                                            <div className="flex justify-between font-bold">
                                                <p>Valor do troco:</p>
                                                <p>{converteReal(pedido.financeiro.valor_troco)}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
