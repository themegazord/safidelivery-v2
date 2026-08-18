import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { IPedido } from "@/types/empresa/pedidos/types";

export interface IMotivoCancelamentoIfood {
    cancelCodeId: string;
    description: string;
}

interface IProps {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    pedido: IPedido | undefined;
    motivos: IMotivoCancelamentoIfood[] | null;
    carregandoMotivos: boolean;
    loading: boolean;
    onSubmit: (dados: { motivo_codigo: string; motivo_descricao: string } | { mensagem: string }) => void;
}

export default function CancelarPedidoDialog({ open, onOpenChange, pedido, motivos, carregandoMotivos, loading, onSubmit }: IProps) {
    const [motivoSelecionado, setMotivoSelecionado] = useState<string>("");
    const [mensagem, setMensagem] = useState<string>("");

    useEffect(() => {
        if (!open) return;
        setMotivoSelecionado("");
        setMensagem("");
    }, [open]);

    const ehIfood = pedido?.pedido_ifood_id !== null && pedido?.pedido_ifood_id !== undefined;

    function confirmar() {
        if (ehIfood) {
            const motivo = motivos?.find((m) => m.cancelCodeId === motivoSelecionado);
            if (!motivo) return;
            onSubmit({ motivo_codigo: motivo.cancelCodeId, motivo_descricao: motivo.description });
            return;
        }
        if (!mensagem) return;
        onSubmit({ mensagem });
    }

    const itemsMotivos = Object.fromEntries((motivos ?? []).map((m) => [m.cancelCodeId, m.description]));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancelamento pedido #{pedido?.ifood_display_id ?? pedido?.id}</DialogTitle>
                </DialogHeader>
                {ehIfood ? (
                    carregandoMotivos || motivos === null ? (
                        <p className="flex items-center gap-2 text-lg font-semibold">
                            <Spinner className="h-4 w-4" /> Carregando os motivos de cancelamento
                        </p>
                    ) : (
                        <Field>
                            <FieldLabel htmlFor="motivo_cancelamento">Motivo de cancelamento</FieldLabel>
                            <Select items={itemsMotivos} value={motivoSelecionado} onValueChange={(v) => setMotivoSelecionado(v as string)}>
                                <SelectTrigger className="w-full" id="motivo_cancelamento">
                                    <SelectValue placeholder="Selecione o motivo para o cancelamento..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {motivos.map((motivo) => (
                                        <SelectItem key={motivo.cancelCodeId} value={motivo.cancelCodeId}>
                                            {motivo.description}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    )
                ) : (
                    <Field>
                        <FieldLabel htmlFor="mensagem_cancelamento">Motivo do cancelamento</FieldLabel>
                        <Textarea
                            id="mensagem_cancelamento"
                            value={mensagem}
                            onChange={(e) => setMensagem(e.target.value)}
                            placeholder="Cliente pediu desistência do item por motivo..."
                            rows={5}
                        />
                    </Field>
                )}
                <DialogFooter className="flex flex-row-reverse gap-4">
                    <Button
                        onClick={confirmar}
                        disabled={loading || (ehIfood ? !motivoSelecionado : !mensagem)}
                        variant="destructive"
                    >
                        {loading ? <><Spinner /> Confirmando...</> : "Confirmar"}
                    </Button>
                    <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
