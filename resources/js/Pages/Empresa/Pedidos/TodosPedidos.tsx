import { useEffect, useRef, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Eye, RotateCcw, Trash2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import PedidoDetalhesDialog from "@/components/Empresa/Pedidos/PedidoDetalhesDialog";
import TipoPedidoIcon from "@/components/Empresa/Pedidos/TipoPedidoIcon";
import { IPaginacao } from "@/types/empresa/cardapios/types";
import { IPedido, IPedidoTodosLinha } from "@/types/empresa/pedidos/types";
import { converteReal } from "@/utils/utils";
import { formatarDataHora } from "@/utils/pedidos";

interface IFiltros {
    busca?: string;
    data_inicio?: string;
    data_fim?: string;
    status?: string;
    tipo?: string;
    origem?: string;
}

interface IProps {
    pedidos: IPaginacao<IPedidoTodosLinha>;
    filtros: IFiltros;
    timezone: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    pendente: { label: "Pendente", className: "bg-amber-500 text-white" },
    "sendo preparado": { label: "Preparando", className: "bg-sky-500 text-white" },
    "pronto para entrega": { label: "Pronto", className: "bg-cyan-500 text-white" },
    "sendo entregue": { label: "Entregando", className: "bg-violet-500 text-white" },
    entregue: { label: "Entregue", className: "bg-emerald-600 text-white" },
    cancelado: { label: "Cancelado", className: "bg-destructive text-white" },
};

export default function TodosPedidos({ pedidos, filtros, timezone }: IProps) {
    const { cnpj } = usePage<{ cnpj: string }>().props;
    const [busca, setBusca] = useState(filtros.busca ?? "");
    const primeiraRenderizacao = useRef(true);

    const [pedidoDetalhe, setPedidoDetalhe] = useState<IPedido | undefined>();
    const [loadingDetalhe, setLoadingDetalhe] = useState(false);
    const [modalDetalheOpen, setModalDetalheOpen] = useState(false);

    const [pedidoParaCancelar, setPedidoParaCancelar] = useState<IPedidoTodosLinha | null>(null);
    const [cancelando, setCancelando] = useState(false);
    const [pedidoParaEntregar, setPedidoParaEntregar] = useState<IPedidoTodosLinha | null>(null);
    const [entregando, setEntregando] = useState(false);

    function aplicarFiltros(novosFiltros: Partial<IFiltros>) {
        router.get(
            route("aplicacao.empresa.pedidos.todos-pedidos", { cnpj }),
            { ...filtros, ...novosFiltros },
            { preserveState: true, replace: true },
        );
    }

    useEffect(() => {
        if (primeiraRenderizacao.current) {
            primeiraRenderizacao.current = false;
            return;
        }
        const temporizador = setTimeout(() => aplicarFiltros({ busca }), 400);
        return () => clearTimeout(temporizador);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busca]);

    function limparFiltros() {
        setBusca("");
        router.get(route("aplicacao.empresa.pedidos.todos-pedidos", { cnpj }), {}, { preserveState: true, replace: true });
    }

    async function abrirDetalhes(pedidoId: number) {
        setModalDetalheOpen(true);
        setLoadingDetalhe(true);
        await axios
            .get(route("aplicacao.empresa.pedidos.show", { cnpj, pedido_id: pedidoId }))
            .then((response) => setPedidoDetalhe(response.data.pedido))
            .catch(() => toast.error("Erro ao carregar o pedido"))
            .finally(() => setLoadingDetalhe(false));
    }

    async function imprimirPedido(pedidoId: number) {
        await axios
            .get(route("aplicacao.empresa.pedidos.url-impressao", { cnpj, pedido_id: pedidoId }))
            .then((response) => window.open(response.data.url, "_blank"))
            .catch(() => toast.error("Erro ao gerar a impressão do pedido"));
    }

    async function confirmarCancelamento() {
        if (!pedidoParaCancelar) return;
        setCancelando(true);
        await axios
            .post(route("aplicacao.empresa.pedidos.todos-pedidos.cancelar", { cnpj, pedido_id: pedidoParaCancelar.id }))
            .then((response) => {
                toast.success(response.data.mensagem);
                setPedidoParaCancelar(null);
                router.reload({ only: ["pedidos"] });
            })
            .catch((error) => toast.error(error.response?.data?.message ?? "Erro ao cancelar o pedido"))
            .finally(() => setCancelando(false));
    }

    async function confirmarEntrega() {
        if (!pedidoParaEntregar) return;
        setEntregando(true);
        await axios
            .post(route("aplicacao.empresa.pedidos.todos-pedidos.confirmar-entrega", { cnpj, pedido_id: pedidoParaEntregar.id }))
            .then((response) => {
                toast.success(response.data.mensagem);
                setPedidoParaEntregar(null);
                router.reload({ only: ["pedidos"] });
            })
            .catch((error) => toast.error(error.response?.data?.message ?? "Erro ao marcar como entregue"))
            .finally(() => setEntregando(false));
    }

    const temFiltrosAtivos = Object.entries(filtros).some(([chave, valor]) => chave !== "data_inicio" && chave !== "data_fim" && valor);

    return (
        <LayoutAutenticado>
            <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                    <h1 className="text-2xl font-bold">Todos os pedidos</h1>
                    <p className="text-sm text-muted-foreground">Histórico completo de pedidos da sua empresa</p>
                </div>
                <Link href={route("aplicacao.empresa.pedidos.index", { cnpj })}>
                    <Button variant="outline">
                        <ArrowLeft /> Voltar
                    </Button>
                </Link>
            </div>

            <Card className="mb-6">
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="sm:col-span-2">
                        <Input placeholder="Buscar por nº, cliente, telefone..." value={busca} onChange={(e) => setBusca(e.target.value)} />
                    </div>
                    <Input type="date" value={filtros.data_inicio ?? ""} onChange={(e) => aplicarFiltros({ data_inicio: e.target.value })} />
                    <Input type="date" value={filtros.data_fim ?? ""} onChange={(e) => aplicarFiltros({ data_fim: e.target.value })} />
                    <Select
                        items={{ "": "Todos", pendente: "Pendente", "sendo preparado": "Em preparo", "pronto para entrega": "Pronto", "sendo entregue": "Em entrega", entregue: "Entregue", cancelado: "Cancelado" }}
                        value={filtros.status ?? ""}
                        onValueChange={(v) => aplicarFiltros({ status: v as string })}
                    >
                        <SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Todos</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="sendo preparado">Em preparo</SelectItem>
                            <SelectItem value="pronto para entrega">Pronto</SelectItem>
                            <SelectItem value="sendo entregue">Em entrega</SelectItem>
                            <SelectItem value="entregue">Entregue</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        items={{ "": "Todos", D: "Delivery", M: "Mesa", R: "Retirada" }}
                        value={filtros.tipo ?? ""}
                        onValueChange={(v) => aplicarFiltros({ tipo: v as string })}
                    >
                        <SelectTrigger className="w-full"><SelectValue placeholder="Tipo" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Todos</SelectItem>
                            <SelectItem value="D">Delivery</SelectItem>
                            <SelectItem value="M">Mesa</SelectItem>
                            <SelectItem value="R">Retirada</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
                <CardContent className="flex flex-wrap items-center gap-4 border-t pt-4">
                    <Select
                        items={{ "": "Todas", direto: "Direto", ifood: "iFood" }}
                        value={filtros.origem ?? ""}
                        onValueChange={(v) => aplicarFiltros({ origem: v as string })}
                    >
                        <SelectTrigger className="w-40"><SelectValue placeholder="Origem" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Todas</SelectItem>
                            <SelectItem value="direto">Direto</SelectItem>
                            <SelectItem value="ifood">iFood</SelectItem>
                        </SelectContent>
                    </Select>
                    {temFiltrosAtivos && (
                        <Button variant="ghost" size="sm" onClick={limparFiltros}>
                            <RotateCcw /> Limpar filtros
                        </Button>
                    )}
                    <div className="ml-auto text-sm text-muted-foreground">{pedidos.total} pedido(s) encontrado(s)</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Data/Hora</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead className="text-center">Tipo</TableHead>
                                <TableHead className="text-center">Origem</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Pagamento</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pedidos.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                                        Nenhum pedido encontrado
                                    </TableCell>
                                </TableRow>
                            )}
                            {pedidos.data.map((pedido) => {
                                const status = STATUS_CONFIG[pedido.status] ?? { label: pedido.status, className: "" };
                                const bloqueado = pedido.status === "cancelado" || pedido.status === "entregue";

                                return (
                                    <TableRow key={pedido.id} className="cursor-pointer" onClick={() => abrirDetalhes(pedido.id)}>
                                        <TableCell className="font-mono font-bold">#{pedido.ifood_display_id ?? pedido.id}</TableCell>
                                        <TableCell>{formatarDataHora(pedido.created_at, timezone)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{pedido.cliente_nome ?? "N/A"}</span>
                                                <span className="text-xs text-muted-foreground">{pedido.cliente_telefone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center">
                                                <TipoPedidoIcon tipo={pedido.tipo} ehIfood={pedido.pedido_ifood_id !== null} className="h-5 w-5" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center">
                                                {pedido.pedido_ifood_id ? (
                                                    <Badge className="bg-amber-500 text-white">iFood</Badge>
                                                ) : (
                                                    <Badge>Direto</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={status.className}>{status.label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-emerald-600">{converteReal(pedido.total)}</TableCell>
                                        <TableCell className="text-sm">{pedido.forma_pagamento_label}</TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                                                    <Eye />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => abrirDetalhes(pedido.id)}>
                                                        <Eye /> Detalhes
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        disabled={bloqueado}
                                                        onClick={() => setPedidoParaCancelar(pedido)}
                                                    >
                                                        <Trash2 /> Cancelar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem disabled={bloqueado} onClick={() => setPedidoParaEntregar(pedido)}>
                                                        <CheckCircle2 /> Entregar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {pedidos.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Página {pedidos.current_page} de {pedidos.last_page} — {pedidos.total} pedidos
                    </p>
                    <div className="flex gap-2">
                        {pedidos.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}

            <PedidoDetalhesDialog
                open={modalDetalheOpen}
                onOpenChange={setModalDetalheOpen}
                pedido={pedidoDetalhe}
                loading={loadingDetalhe}
                timezone={timezone}
                variante="passado"
                onImprimir={imprimirPedido}
            />

            <Dialog open={pedidoParaCancelar !== null} onOpenChange={(v) => !v && setPedidoParaCancelar(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancelar pedido?</DialogTitle>
                    </DialogHeader>
                    <p>Deseja cancelar o pedido <b>#{pedidoParaCancelar?.ifood_display_id ?? pedidoParaCancelar?.id}</b>?</p>
                    <DialogFooter className="flex flex-row-reverse gap-4">
                        <Button variant="destructive" onClick={confirmarCancelamento} disabled={cancelando}>
                            {cancelando ? <Spinner /> : <XCircle />} Cancelar pedido
                        </Button>
                        <DialogClose render={<Button variant="outline" />}>Voltar</DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={pedidoParaEntregar !== null} onOpenChange={(v) => !v && setPedidoParaEntregar(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Marcar como entregue?</DialogTitle>
                    </DialogHeader>
                    <p>Confirmar que o pedido <b>#{pedidoParaEntregar?.ifood_display_id ?? pedidoParaEntregar?.id}</b> foi entregue?</p>
                    <DialogFooter className="flex flex-row-reverse gap-4">
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={confirmarEntrega} disabled={entregando}>
                            {entregando ? <Spinner /> : <CheckCircle2 />} Confirmar entrega
                        </Button>
                        <DialogClose render={<Button variant="outline" />}>Voltar</DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LayoutAutenticado>
    );
}
