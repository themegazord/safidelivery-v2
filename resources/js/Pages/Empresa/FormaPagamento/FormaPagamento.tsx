import { useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import {
    TFormaPagamento,
    TTipoFormaPagamento,
    TTipoOpcaoFormaPagamento,
} from "@/types/empresa/formapagamento/types";
import { CreditCard, Pencil, Plus, Trash2 } from "lucide-react";

interface IProps {
    formasPagamento: TFormaPagamento[];
    tiposOpcoes: TTipoOpcaoFormaPagamento[];
}

const FORMULARIO_PADRAO = {
    descricao: "",
    tipo: "" as TTipoFormaPagamento | "",
    codigo_pdv: "",
    interno: false,
};

export default function FormaPagamento({ formasPagamento, tiposOpcoes }: IProps) {
    const { cnpj } = usePage<{ cnpj: string }>().props;

    const [lista, setLista] = useState<TFormaPagamento[]>(formasPagamento);
    const [dialogAberto, setDialogAberto] = useState(false);
    const [formaEmEdicao, setFormaEmEdicao] = useState<TFormaPagamento | null>(null);
    const [formulario, setFormulario] = useState(FORMULARIO_PADRAO);
    const [salvando, setSalvando] = useState(false);
    const [removendo, setRemovendo] = useState<number | null>(null);

    function abrirCriacao() {
        setFormaEmEdicao(null);
        setFormulario(FORMULARIO_PADRAO);
        setDialogAberto(true);
    }

    function abrirEdicao(forma: TFormaPagamento) {
        setFormaEmEdicao(forma);
        setFormulario({
            descricao: forma.descricao,
            tipo: forma.tipo,
            codigo_pdv: forma.codigo_pdv !== null ? String(forma.codigo_pdv) : "",
            interno: forma.interno,
        });
        setDialogAberto(true);
    }

    async function salvar() {
        if (!formulario.descricao || !formulario.tipo) {
            toast.warning("Preencha a descrição e o tipo da forma de pagamento.");
            return;
        }

        const payload = {
            descricao: formulario.descricao,
            tipo: formulario.tipo,
            codigo_pdv: formulario.codigo_pdv ? Number(formulario.codigo_pdv) : null,
            interno: formulario.interno,
        };

        setSalvando(true);
        const requisicao = formaEmEdicao
            ? axios.put(
                  route("aplicacao.empresa.formapagamento.update", {
                      cnpj,
                      forma_pagamento_id: formaEmEdicao.id,
                  }),
                  payload,
              )
            : axios.post(route("aplicacao.empresa.formapagamento.store", { cnpj }), payload);

        await requisicao
            .then((response) => {
                toast.success(response.data.mensagem);
                setLista((atual) => {
                    if (formaEmEdicao) {
                        return atual.map((item) =>
                            item.id === formaEmEdicao.id ? response.data.formaPagamento : item,
                        );
                    }
                    return [...atual, response.data.formaPagamento];
                });
                setDialogAberto(false);
            })
            .catch((error) =>
                toast.error(
                    error.response?.data?.message ?? "Não foi possível salvar a forma de pagamento",
                ),
            )
            .finally(() => setSalvando(false));
    }

    async function remover(id: number) {
        setRemovendo(id);
        await axios
            .delete(route("aplicacao.empresa.formapagamento.destroy", { cnpj, forma_pagamento_id: id }))
            .then((response) => {
                toast.success(response.data.mensagem);
                setLista((atual) => atual.filter((item) => item.id !== id));
            })
            .catch((error) =>
                toast.error(
                    error.response?.data?.message ?? "Não foi possível remover a forma de pagamento",
                ),
            )
            .finally(() => setRemovendo(null));
    }

    function labelTipo(tipo: TTipoFormaPagamento) {
        return tiposOpcoes.find((opcao) => opcao.id === tipo)?.name ?? tipo;
    }

    return (
        <LayoutAutenticado>
            <div className="space-y-6">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight">Formas de pagamento</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Cadastre as formas de pagamento aceitas pela sua loja.
                    </p>
                </header>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Formas cadastradas</CardTitle>
                            <CardDescription>{lista.length} forma(s) de pagamento</CardDescription>
                        </div>
                        <Button size="sm" onClick={abrirCriacao}>
                            <Plus /> Nova forma de pagamento
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {lista.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground/60">
                                <CreditCard className="h-8 w-8" />
                                <p className="text-sm">Nenhuma forma de pagamento cadastrada</p>
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y">
                                {lista.map((forma) => (
                                    <div key={forma.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{forma.descricao}</p>
                                                {forma.interno && (
                                                    <Badge variant="outline">Uso interno</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {labelTipo(forma.tipo)}
                                                {forma.codigo_pdv !== null
                                                    ? ` · Código PDV: ${forma.codigo_pdv}`
                                                    : ""}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => abrirEdicao(forma)}
                                                aria-label="Editar forma de pagamento"
                                            >
                                                <Pencil className="h-4 w-4 cursor-pointer text-muted-foreground" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => remover(forma.id)}
                                                disabled={removendo === forma.id}
                                                aria-label="Remover forma de pagamento"
                                            >
                                                <Trash2 className="h-5 w-5 cursor-pointer text-destructive" />
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
                        <DialogTitle>
                            {formaEmEdicao ? "Editar forma de pagamento" : "Nova forma de pagamento"}
                        </DialogTitle>
                        <DialogDescription>
                            Formas marcadas como "uso interno" não aparecem para o cliente no cardápio digital.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="forma-pagamento-descricao">Descrição</FieldLabel>
                            <Input
                                id="forma-pagamento-descricao"
                                placeholder="Ex: Pix, Dinheiro, Cartão Visa"
                                value={formulario.descricao}
                                onChange={(e) =>
                                    setFormulario((atual) => ({ ...atual, descricao: e.target.value }))
                                }
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="forma-pagamento-tipo">Tipo</FieldLabel>
                            <Select
                                name="forma-pagamento-tipo"
                                value={formulario.tipo || undefined}
                                onValueChange={(value) =>
                                    setFormulario((atual) => ({
                                        ...atual,
                                        tipo: (value ?? "") as TTipoFormaPagamento | "",
                                    }))
                                }
                            >
                                <SelectTrigger id="forma-pagamento-tipo" className="w-full">
                                    <SelectValue placeholder="Selecione...">
                                        {(value: string | null) =>
                                            tiposOpcoes.find((opcao) => opcao.id === value)?.name ??
                                            "Selecione..."
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {tiposOpcoes.map((opcao) => (
                                        <SelectItem key={opcao.id} value={opcao.id}>
                                            {opcao.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="forma-pagamento-codigo-pdv">Código PDV</FieldLabel>
                            <Input
                                id="forma-pagamento-codigo-pdv"
                                type="number"
                                placeholder="Opcional"
                                value={formulario.codigo_pdv}
                                onChange={(e) =>
                                    setFormulario((atual) => ({ ...atual, codigo_pdv: e.target.value }))
                                }
                            />
                        </Field>

                        <Field className="flex flex-row items-center justify-between">
                            <Label htmlFor="forma-pagamento-interno">Uso interno (não exibir ao cliente)</Label>
                            <Switch
                                id="forma-pagamento-interno"
                                checked={formulario.interno}
                                onCheckedChange={(checked) =>
                                    setFormulario((atual) => ({ ...atual, interno: checked }))
                                }
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
