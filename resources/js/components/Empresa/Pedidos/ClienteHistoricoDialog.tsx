import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IHistoricoCliente } from "@/types/empresa/pedidos/types";
import { converteReal } from "@/utils/utils";
import { Calendar, Heart, MapPin, Phone, ShoppingCart, Eye } from "lucide-react";

interface IProps {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    historico: IHistoricoCliente | undefined;
    loading: boolean;
    onMudarPagina: (page: number) => void;
    onVerPedido: (pedidoId: number) => void;
}

function CardStat({ icon, valor, label }: { icon: React.ReactNode; valor: React.ReactNode; label: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-1 rounded bg-card px-4 py-4 shadow-sm">
            <div className="flex items-center justify-center rounded bg-sky-100 p-2 dark:bg-sky-950">{icon}</div>
            <p className="truncate text-lg font-bold">{valor}</p>
            <p className="text-center text-sm font-bold text-muted-foreground">{label}</p>
        </div>
    );
}

export default function ClienteHistoricoDialog({ open, onOpenChange, historico, loading, onMudarPagina, onVerPedido }: IProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] w-full max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-3xl lg:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>{historico ? `Cliente ${historico.cliente.nome}` : "Cliente"}</DialogTitle>
                </DialogHeader>
                {loading || !historico ? (
                    <div className="flex h-40 items-center justify-center">
                        <Spinner className="h-8 w-8" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="col-span-1 flex justify-center gap-8 rounded bg-card px-8 py-4 shadow-sm sm:col-span-2">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex items-center justify-center rounded bg-sky-100 p-2 dark:bg-sky-950">
                                        <Heart className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                                    </div>
                                    <p className="text-lg font-bold">{historico.itens_mais_pedidos[0]?.nome ?? "—"}</p>
                                    <p className="text-base font-bold text-muted-foreground">Item mais pedido</p>
                                </div>
                                <div className="flex w-1/2 flex-col">
                                    {historico.itens_mais_pedidos.slice(0, 5).map((produto, idx) => (
                                        <p key={idx} className="truncate">
                                            <b>{produto.qtde}</b> {produto.nome}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <CardStat
                                icon={<ShoppingCart className="h-4 w-4 text-sky-600 dark:text-sky-300" />}
                                valor={historico.qtde_pedidos}
                                label="Pedidos realizados"
                            />
                            <CardStat
                                icon={<span className="text-sky-600 dark:text-sky-300">R$</span>}
                                valor={converteReal(historico.total_gasto)}
                                label="Total gasto"
                            />
                            <CardStat
                                icon={<Phone className="h-4 w-4 text-sky-600 dark:text-sky-300" />}
                                valor={historico.cliente.telefone}
                                label="Telefone"
                            />
                            {historico.cliente.endereco && (
                                <CardStat
                                    icon={<MapPin className="h-4 w-4 text-sky-600 dark:text-sky-300" />}
                                    valor={`${historico.cliente.endereco.logradouro}, ${historico.cliente.endereco.bairro}`}
                                    label="Endereço"
                                />
                            )}
                            {historico.primeiro_pedido && (
                                <CardStat
                                    icon={<Calendar className="h-4 w-4 text-sky-600 dark:text-sky-300" />}
                                    valor={historico.primeiro_pedido}
                                    label="Primeiro pedido"
                                />
                            )}
                            {historico.ultimo_pedido && (
                                <CardStat
                                    icon={<Calendar className="h-4 w-4 text-sky-600 dark:text-sky-300" />}
                                    valor={historico.ultimo_pedido}
                                    label="Último pedido"
                                />
                            )}
                        </div>

                        <div className="rounded bg-card p-4 shadow-sm">
                            <p className="text-lg font-bold">Pedidos do cliente {historico.cliente.nome}</p>
                            <p className="text-sm text-muted-foreground">Todos os pedidos entregues por {historico.cliente.nome}</p>
                            <Table className="mt-4">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Nº do pedido</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Pagamento</TableHead>
                                        <TableHead>Tipo de pedido</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historico.pedidos.data.map((pedido) => (
                                        <TableRow key={pedido.id}>
                                            <TableCell>{pedido.created_at}</TableCell>
                                            <TableCell>#{pedido.id}</TableCell>
                                            <TableCell>{converteReal(pedido.valor ?? 0)}</TableCell>
                                            <TableCell>{pedido.forma_pagamento}</TableCell>
                                            <TableCell>{pedido.tipo_pedido}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => onVerPedido(pedido.id)}>
                                                    <Eye />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {historico.pedidos.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Página {historico.pedidos.current_page} de {historico.pedidos.last_page}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={historico.pedidos.current_page <= 1}
                                            onClick={() => onMudarPagina(historico.pedidos.current_page - 1)}
                                        >
                                            Anterior
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={historico.pedidos.current_page >= historico.pedidos.last_page}
                                            onClick={() => onMudarPagina(historico.pedidos.current_page + 1)}
                                        >
                                            Próxima
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
