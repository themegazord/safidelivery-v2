import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { IPedido } from "@/types/empresa/pedidos/types";
import { converteReal } from "@/utils/utils";
import { CheckCircle2, Info } from "lucide-react";

interface IProps {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    pedido: IPedido | undefined;
    loading: boolean;
    onSubmit: () => void;
}

export default function ConfirmarEntregaDialog({ open, onOpenChange, pedido, loading, onSubmit }: IProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirmar entrega</DialogTitle>
                    <DialogDescription>Confirme que o pedido foi entregue ao cliente.</DialogDescription>
                </DialogHeader>
                {pedido && (
                    <div className="flex flex-col gap-4">
                        <div className="rounded-lg bg-muted p-4">
                            <p className="text-lg font-semibold">
                                Pedido #{pedido.ifood_display_id ?? pedido.id}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {pedido.tipo === "M" ? `Mesa ${pedido.mesa}` : "Delivery - pronto para entrega"}
                            </p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <h4 className="mb-2 font-semibold">Cliente</h4>
                            <p className="text-sm">{pedido.cliente?.nome ?? pedido.nome}</p>
                            <p className="text-sm text-muted-foreground">{pedido.cliente?.telefone ?? pedido.telefone}</p>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 p-4">
                            <span className="font-semibold">Total do pedido</span>
                            <span className="text-xl font-bold text-emerald-600">{converteReal(pedido.financeiro?.total ?? 0)}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Info className="mt-0.5 h-5 w-5 shrink-0" />
                            <p>Ao confirmar, o pedido será marcado como entregue e não poderá mais ser alterado.</p>
                        </div>
                    </div>
                )}
                <DialogFooter className="flex flex-row-reverse gap-4">
                    <Button onClick={onSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                        {loading ? <><Spinner /> Confirmando...</> : <><CheckCircle2 /> Confirmar entrega</>}
                    </Button>
                    <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
