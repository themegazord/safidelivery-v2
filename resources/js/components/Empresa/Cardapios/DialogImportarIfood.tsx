import { useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
} from "@/components/ui/combobox";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowDownToLine } from "lucide-react";

const DIAS_SEMANA = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Segunda-feira" },
    { value: 2, label: "Terça-feira" },
    { value: 3, label: "Quarta-feira" },
    { value: 4, label: "Quinta-feira" },
    { value: 5, label: "Sexta-feira" },
    { value: 6, label: "Sábado" },
] as const;

const TIPO_FUNCIONAMENTO = [
    { value: "delivery", label: "Delivery" },
    { value: "mesa", label: "Atendimento em mesa" },
] as const;

const DIA_SEMANA = (value: number) =>
    DIAS_SEMANA.find((ds) => ds.value === value)?.label ?? "—";

type TDiaSemana = { value: number; label: string };

export default function DialogImportarIfood({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (value: boolean) => void;
}) {
    const { cnpj } = usePage<{ cnpj: string }>().props;

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<{
            nome: string;
            descricao: string;
            dias_funcionamento: Array<number | string>;
            tipo_funcionamento?: "delivery" | "mesa";
            importar_item: boolean;
            importar_complementos: boolean;
            importar_imagem: boolean;
            importar_preco: boolean;
        }>({
            nome: "",
            descricao: "",
            dias_funcionamento: [],
            tipo_funcionamento: undefined,
            importar_item: false,
            importar_complementos: false,
            importar_imagem: false,
            importar_preco: false,
        });

    useEffect(() => {
        if (!open) return;
        reset();
        clearErrors();
    }, [open]);

    useEffect(() => {
        if (!data.importar_item) {
            setData((prev) => ({
                ...prev,
                importar_complementos: false,
                importar_imagem: false,
                importar_preco: false,
            }));
        }
    }, [data.importar_item]);

    function importarCardapio(e: React.SubmitEvent) {
        e.preventDefault();

        post(
            route("aplicacao.empresa.cardapios.import_ifood", {
                cnpj,
            }),
            {
                onSuccess: () => {
                    toast.success("Cardápio importado com sucesso");
                    reset();
                    onOpenChange(false);
                },
                onError: () => {
                    toast.error("Verifique os campos e tente novamente");
                },
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Importar cardápio do iFood</DialogTitle>
                    <DialogDescription>
                        Sincronize seu cardápio diretamente da plataforma iFood.
                    </DialogDescription>
                </DialogHeader>

                <form id="form-importar-ifood" onSubmit={importarCardapio}>
                    <FieldGroup>
                        <Field data-invalid={!!errors.nome}>
                            <FieldLabel htmlFor="nome">
                                Nome do cardápio
                            </FieldLabel>
                            <Input
                                id="nome"
                                placeholder="Insira o nome do cardápio"
                                value={data.nome}
                                onChange={(e) =>
                                    setData("nome", e.target.value)
                                }
                                aria-invalid={!!errors.nome}
                            />
                            <p className="text-muted-foreground text-xs">
                                Nome que aparecerá no seu sistema
                            </p>
                            <FieldError>{errors.nome}</FieldError>
                        </Field>

                        <Field data-invalid={!!errors.descricao}>
                            <FieldLabel htmlFor="descricao">
                                Descrição do cardápio
                            </FieldLabel>
                            <Textarea
                                id="descricao"
                                placeholder="Insira a descrição do cardápio"
                                rows={3}
                                value={data.descricao}
                                onChange={(e) =>
                                    setData("descricao", e.target.value)
                                }
                                aria-invalid={!!errors.descricao}
                            />
                            <p className="text-muted-foreground text-xs">
                                Descrição opcional do cardápio
                            </p>
                            <FieldError>{errors.descricao}</FieldError>
                        </Field>

                        <Field data-invalid={!!errors.dias_funcionamento}>
                            <FieldLabel htmlFor="dias_funcionamento">
                                Dias de funcionamento
                            </FieldLabel>
                            <Combobox
                                id="dias_funcionamento"
                                items={DIAS_SEMANA}
                                multiple
                                itemToStringValue={(item: TDiaSemana) =>
                                    item.label
                                }
                                value={DIAS_SEMANA.filter((ds) =>
                                    data.dias_funcionamento.includes(ds.value),
                                )}
                                onValueChange={(itens: TDiaSemana[]) =>
                                    setData(
                                        "dias_funcionamento",
                                        itens.map((i) => i.value),
                                    )
                                }
                            >
                                <ComboboxChips>
                                    <ComboboxValue>
                                        {data.dias_funcionamento.map((df) => (
                                            <ComboboxChip key={df}>
                                                {DIA_SEMANA(Number(df))}
                                            </ComboboxChip>
                                        ))}
                                        <ComboboxChipsInput placeholder="Selecione os dias de funcionamento" />
                                    </ComboboxValue>
                                </ComboboxChips>
                                <ComboboxContent>
                                    <ComboboxEmpty>
                                        Não contêm dias a ser informado
                                    </ComboboxEmpty>
                                    <ComboboxList>
                                        {(item: TDiaSemana) => (
                                            <ComboboxItem
                                                key={item.value}
                                                value={item}
                                            >
                                                {item.label}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                            <p className="text-muted-foreground text-xs">
                                Selecione os dias que o cardápio vai funcionar
                            </p>
                            <FieldError>{errors.dias_funcionamento}</FieldError>
                        </Field>

                        <Field data-invalid={!!errors.tipo_funcionamento}>
                            <FieldLabel>Tipo de funcionamento</FieldLabel>
                            <Select
                                value={data.tipo_funcionamento}
                                onValueChange={(v) => {
                                    if (v) setData("tipo_funcionamento", v)
                                }}
                            >
                                <SelectTrigger
                                    aria-invalid={!!errors.tipo_funcionamento}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>
                                            Tipo de funcionamento
                                        </SelectLabel>
                                        {TIPO_FUNCIONAMENTO.map((tp) => (
                                            <SelectItem
                                                key={tp.value}
                                                value={tp.value}
                                            >
                                                {tp.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <FieldError>{errors.tipo_funcionamento}</FieldError>
                        </Field>

                        <div className="mt-4 border-t pt-4">
                            <p className="mb-3 text-sm font-semibold">
                                Opções de importação
                            </p>

                            <div className="mb-4 flex items-center gap-2">
                                <Checkbox
                                    id="importar_item"
                                    checked={data.importar_item}
                                    onCheckedChange={(checked: boolean) =>
                                        setData(
                                            "importar_item",
                                            checked === true,
                                        )
                                    }
                                />
                                <FieldLabel htmlFor="importar_item">
                                    Importar itens das categorias
                                </FieldLabel>
                            </div>

                            <div className="mb-4 flex items-center gap-2">
                                <Checkbox
                                    id="importar_complementos"
                                    checked={data.importar_complementos}
                                    disabled={!data.importar_item}
                                    onCheckedChange={(checked: boolean) =>
                                        setData(
                                            "importar_complementos",
                                            checked === true,
                                        )
                                    }
                                />
                                <FieldLabel htmlFor="importar_complementos">
                                    Importar complemento dos itens
                                </FieldLabel>
                            </div>

                            <div className="mb-4 flex items-center gap-2">
                                <Checkbox
                                    id="importar_imagem"
                                    checked={data.importar_imagem}
                                    disabled={!data.importar_item}
                                    onCheckedChange={(checked: boolean) =>
                                        setData(
                                            "importar_imagem",
                                            checked === true,
                                        )
                                    }
                                />
                                <div>
                                    <FieldLabel htmlFor="importar_imagem">
                                        Importar imagens dos produtos
                                    </FieldLabel>
                                    <p className="text-muted-foreground text-xs">
                                        As imagens serão baixadas do iFood
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4 flex items-center gap-2">
                                <Checkbox
                                    id="importar_preco"
                                    checked={data.importar_preco}
                                    disabled={!data.importar_item}
                                    onCheckedChange={(checked: boolean) =>
                                        setData(
                                            "importar_preco",
                                            checked === true,
                                        )
                                    }
                                />
                                <div>
                                    <FieldLabel htmlFor="importar_preco">
                                        Importar preços
                                    </FieldLabel>
                                    <p className="text-muted-foreground text-xs">
                                        Usar os preços configurados no iFood
                                    </p>
                                </div>
                            </div>
                        </div>
                    </FieldGroup>
                </form>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        className="flex items-center gap-2"
                        type="submit"
                        form="form-importar-ifood"
                        disabled={processing}
                    >
                        {processing ? <Spinner /> : <ArrowDownToLine />}
                        {processing ? "Importando..." : "Importar cardápio"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
