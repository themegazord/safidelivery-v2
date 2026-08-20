import { useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import { TMesa } from "@/types/empresa/qrcodemesa/types";
import { Copy, Download, Pencil, Plus, QrCode, Trash2 } from "lucide-react";

interface IProps {
    mesas: TMesa[];
}

export default function QrCodeMesa({ mesas }: IProps) {
    const { cnpj } = usePage<{ cnpj: string }>().props;

    const [lista, setLista] = useState<TMesa[]>(mesas);
    const [dialogAberto, setDialogAberto] = useState(false);
    const [mesaEmEdicao, setMesaEmEdicao] = useState<TMesa | null>(null);
    const [numeroMesa, setNumeroMesa] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [removendo, setRemovendo] = useState<number | null>(null);

    const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

    function abrirCriacao() {
        setMesaEmEdicao(null);
        setNumeroMesa("");
        setDialogAberto(true);
    }

    function abrirEdicao(mesa: TMesa) {
        setMesaEmEdicao(mesa);
        setNumeroMesa(String(mesa.mesa));
        setDialogAberto(true);
    }

    async function salvar() {
        if (!numeroMesa) {
            toast.warning("Informe o número da mesa.");
            return;
        }

        setSalvando(true);
        const requisicao = mesaEmEdicao
            ? axios.put(
                  route("aplicacao.empresa.qrcodemesa.update", { cnpj, mesa_id: mesaEmEdicao.id }),
                  { mesa: numeroMesa },
              )
            : axios.post(route("aplicacao.empresa.qrcodemesa.store", { cnpj }), { mesa: numeroMesa });

        await requisicao
            .then((response) => {
                toast.success(response.data.mensagem);
                setLista((atual) => {
                    if (mesaEmEdicao) {
                        return atual
                            .map((item) => (item.id === mesaEmEdicao.id ? response.data.mesa : item))
                            .sort((a, b) => a.mesa - b.mesa);
                    }
                    return [...atual, response.data.mesa].sort((a, b) => a.mesa - b.mesa);
                });
                setDialogAberto(false);
            })
            .catch((error) =>
                toast.error(error.response?.data?.message ?? "Não foi possível salvar a mesa"),
            )
            .finally(() => setSalvando(false));
    }

    async function remover(id: number) {
        setRemovendo(id);
        await axios
            .delete(route("aplicacao.empresa.qrcodemesa.destroy", { cnpj, mesa_id: id }))
            .then((response) => {
                toast.success(response.data.mensagem);
                setLista((atual) => atual.filter((item) => item.id !== id));
            })
            .catch((error) =>
                toast.error(error.response?.data?.message ?? "Não foi possível remover a mesa"),
            )
            .finally(() => setRemovendo(null));
    }

    function copiarLink(link: string) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link);
            toast.success("Link copiado com sucesso!");
            return;
        }
        const textarea = document.createElement("textarea");
        textarea.value = link;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toast.success("Link copiado com sucesso!");
    }

    function baixarQrCode(mesa: TMesa) {
        const canvas = canvasRefs.current.get(mesa.id);
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (!blob) return;

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `mesa-${mesa.mesa}-qrcode.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, "image/png");
    }

    return (
        <LayoutAutenticado>
            <div className="space-y-6">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight">QR Code das mesas</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Gere um QR Code por mesa para o cliente acessar o cardápio digital direto dela.
                    </p>
                </header>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Mesas cadastradas</CardTitle>
                            <CardDescription>{lista.length} mesa(s)</CardDescription>
                        </div>
                        <Button size="sm" onClick={abrirCriacao}>
                            <Plus /> Nova mesa
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {lista.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground/60">
                                <QrCode className="h-8 w-8" />
                                <p className="text-sm">Nenhuma mesa cadastrada</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {lista.map((mesa) => (
                                    <div
                                        key={mesa.id}
                                        className="flex flex-col items-center gap-3 rounded-xl border p-4"
                                    >
                                        <p className="text-sm font-semibold">Mesa {mesa.mesa}</p>
                                        <div className="rounded-lg border bg-white p-2">
                                            <QRCodeCanvas
                                                value={mesa.link_gerado}
                                                size={140}
                                                marginSize={2}
                                                ref={(canvas) => {
                                                    if (canvas) canvasRefs.current.set(mesa.id, canvas);
                                                    else canvasRefs.current.delete(mesa.id);
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => baixarQrCode(mesa)}
                                            >
                                                <Download className="h-4 w-4" /> Baixar
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copiarLink(mesa.link_gerado)}
                                            >
                                                <Copy className="h-4 w-4" /> Link
                                            </Button>
                                            <button
                                                type="button"
                                                onClick={() => abrirEdicao(mesa)}
                                                aria-label="Editar mesa"
                                            >
                                                <Pencil className="h-4 w-4 cursor-pointer text-muted-foreground" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => remover(mesa.id)}
                                                disabled={removendo === mesa.id}
                                                aria-label="Remover mesa"
                                            >
                                                <Trash2 className="h-4 w-4 cursor-pointer text-destructive" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{mesaEmEdicao ? "Editar mesa" : "Nova mesa"}</DialogTitle>
                        <DialogDescription>
                            O número da mesa é usado pelo cliente para identificar o pedido.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="numero-mesa">Número da mesa</FieldLabel>
                            <Input
                                id="numero-mesa"
                                type="number"
                                min={1}
                                placeholder="Ex: 1"
                                value={numeroMesa}
                                onChange={(e) => setNumeroMesa(e.target.value)}
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="flex flex-row-reverse gap-4">
                        <Button onClick={salvar} disabled={salvando}>
                            {salvando ? (
                                <>
                                    <Spinner /> Salvando...
                                </>
                            ) : (
                                "Salvar"
                            )}
                        </Button>
                        <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LayoutAutenticado>
    );
}
