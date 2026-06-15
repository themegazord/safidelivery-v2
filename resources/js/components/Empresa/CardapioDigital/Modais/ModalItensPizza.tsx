import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from "@/components/ui/input-group";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { H4, H5, H6 } from "@/components/utils/Heading";
import { cn } from "@/lib/utils";
import { IItemPizza, TManipulaPedidoItem } from "@/types/cardapio-digital/item-pedido";
import {
    Clock3,
    InfoIcon,
    Minus,
    Pizza,
    Plus,
    ShoppingCart,
} from "lucide-react";
import { CLASSIFICACOES_DISPONIVEIS, CORES_BADGE } from "../MenuItemCard";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

interface IProps {
    item?: IItemPizza;
    open: boolean;
    setOpen: (valor: null) => void;
    adicionaQtde: TManipulaPedidoItem;
    diminuiQtde: TManipulaPedidoItem;
    adicionaObservacao: (observacao: string) => void;
    adicionaItemCarrinho: () => void;
    defineMassaSelecionada: (value: string) => void;
    defineBordaSelecionada: (value: string) => void;
    pendenciasDeItens: { massa: boolean; borda: boolean; sabores: boolean };
}

export default function ModalItensPizza({
    item,
    open,
    setOpen,
    adicionaQtde,
    diminuiQtde,
    adicionaObservacao,
    adicionaItemCarrinho,
    defineMassaSelecionada,
    defineBordaSelecionada,
    pendenciasDeItens,
}: IProps) {
    function converteReal(valor?: number | string) {
        const num =
            typeof valor === "string"
                ? parseFloat(valor.replace(",", "."))
                : Number(valor);
        return num.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }
    return (
        <Dialog open={open} onOpenChange={() => setOpen(null)}>
            <DialogContent
                className="flex max-h-[90dvh] w-11/12 flex-col overflow-hidden md:max-w-5xl"
                aria-describedby={undefined}
            >
                <DialogHeader className="shrink-0">
                    <DialogTitle>
                        {`${item?.nome.toUpperCase()} (${item?.qtde_pedacos ?? 1} ${(item?.qtde_pedacos ?? 1) > 1 ? "PEDAÇOS" : "PEDAÇO"})`}
                    </DialogTitle>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
                    <div className="bg-background/20 flex w-full items-center justify-between rounded-lg p-4">
                        <div>
                            <p className="text-foreground text-sm">
                                Valor inicial
                            </p>
                            <H4 className="text-primary font-bold">
                                R$ {converteReal(item?.menorValorTamanho)}
                            </H4>
                        </div>
                        <div className="text-right">
                            <p className="text-foreground text-sm">
                                Sabores selecionados
                            </p>
                            <H5>
                                {item?.quantidade_sabores_selecionadas} /{" "}
                                {item?.quantidade_sabor}
                            </H5>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex w-full flex-col space-y-4">
                            <Alert className="border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-50">
                                <InfoIcon />
                                <AlertTitle>{`${item?.quantidade_sabor === 1 ? "Escolha 1 sabor" : "Escolha até " + item?.quantidade_sabor + "sabores"}`}</AlertTitle>
                                <AlertDescription>
                                    Você selecionou{" "}
                                    {item?.quantidade_sabores_selecionadas} de{" "}
                                    {item?.quantidade_sabor}{" "}
                                    {(item?.quantidade_sabor ?? 1) > 1
                                        ? "sabores"
                                        : "sabor"}
                                </AlertDescription>
                            </Alert>

                            {(item?.quantidade_sabor ?? 1) > 1 && (
                                <Progress
                                    value={
                                        item?.quantidade_sabores_selecionadas
                                    }
                                    max={item?.quantidade_sabor ?? 1}
                                />
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock3 /> Tipo de massas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4 md:grid md:grid-cols-4">
                                    <div className="col-span-3">
                                        <Field
                                            data-invalid={
                                                pendenciasDeItens.massa
                                            }
                                        >
                                            <Select
                                                onValueChange={(value) =>
                                                    defineMassaSelecionada(
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    aria-invalid={
                                                        pendenciasDeItens.massa
                                                    }
                                                    className="w-full"
                                                >
                                                    <SelectValue placeholder="Selecione a massa..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {(
                                                            item?.massas ?? []
                                                        ).map((massa) => (
                                                            <SelectItem
                                                                value={String(
                                                                    massa.id,
                                                                )}
                                                                key={massa.id}
                                                            >
                                                                {massa.nome}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            {pendenciasDeItens.massa && (
                                                <FieldError>
                                                    Selecione uma massa
                                                </FieldError>
                                            )}
                                        </Field>
                                    </div>
                                    <InputGroup>
                                        <InputGroupInput
                                            value={converteReal(
                                                item?.massaSelecionada?.preco ??
                                                    0,
                                            )}
                                            disabled
                                        />
                                        <InputGroupAddon>
                                            <InputGroupText>
                                                {(item?.massaSelecionada
                                                    ?.preco ?? 0 > 1)
                                                    ? "+"
                                                    : ""}{" "}
                                                R$
                                            </InputGroupText>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock3 /> Tipo de bordas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4 md:grid md:grid-cols-4">
                                    <div className="col-span-3">
                                        <Field
                                            data-invalid={
                                                pendenciasDeItens.borda
                                            }
                                        >
                                            <Select
                                                onValueChange={(value) =>
                                                    defineBordaSelecionada(
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    aria-invalid={
                                                        pendenciasDeItens.borda
                                                    }
                                                    className="w-full"
                                                >
                                                    <SelectValue placeholder="Selecione a borda..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {(
                                                            item?.bordas ?? []
                                                        ).map((borda) => (
                                                            <SelectItem
                                                                value={String(
                                                                    borda.id,
                                                                )}
                                                                key={borda.id}
                                                            >
                                                                {borda.nome}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            {pendenciasDeItens.borda && (
                                                <FieldError>
                                                    Selecione uma borda.
                                                </FieldError>
                                            )}
                                        </Field>
                                    </div>
                                    <InputGroup>
                                        <InputGroupInput
                                            value={converteReal(
                                                item?.bordaSelecionada?.preco ??
                                                    0,
                                            )}
                                            disabled
                                        />
                                        <InputGroupAddon>
                                            <InputGroupText>
                                                {(item?.bordaSelecionada
                                                    ?.preco ?? 0 > 1)
                                                    ? "+"
                                                    : ""}{" "}
                                                R$
                                            </InputGroupText>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </CardContent>
                            </Card>

                            <div className="flex items-center gap-4">
                                <Separator className="flex-1" />
                                <H6 className="font-bold whitespace-nowrap">
                                    Sabores disponíveis
                                </H6>
                                <Separator className="flex-1" />
                            </div>

                            {(item?.sabores ?? []).map((sabor, idx) => {
                                let itemSelecionado =
                                    (item?.sabores[idx].quantidade ?? 0) > 0;
                                return (
                                    <Card
                                        key={sabor.id}
                                        aria-invalid={pendenciasDeItens.sabores}
                                        className={cn(
                                            "aria-invalid:border-destructive aria-invalid:ring-destructive/60 transition-all aria-invalid:ring-3",
                                            itemSelecionado
                                                ? "border-primary bg-primary/5 border-2"
                                                : "",
                                        )}
                                    >
                                        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-12">
                                            {/* Imagem */}
                                            <div className="md:col-span-2">
                                                <div
                                                    className={cn(
                                                        "w-24 rounded-lg",
                                                        itemSelecionado
                                                            ? "ring-primary ring ring-offset-2"
                                                            : "",
                                                    )}
                                                >
                                                    {sabor.imagem ? (
                                                        <img
                                                            src={sabor.imagem}
                                                            alt={`Imagem do sabor ${sabor.nome}`}
                                                            loading="lazy"
                                                            className="aspect-square w-24 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="border-border flex items-center justify-center">
                                                            <Pizza />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Informações */}
                                            <div className="md:col-span-7">
                                                <CardHeader>
                                                    <CardTitle>
                                                        {sabor.nome}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {sabor.descricao}
                                                    </CardDescription>
                                                </CardHeader>

                                                <div className="mt-2">
                                                    {sabor.classificacao
                                                        .length > 0 &&
                                                        sabor.classificacao.map(
                                                            (c, ci) => {
                                                                const classificacao =
                                                                    CLASSIFICACOES_DISPONIVEIS[
                                                                        c
                                                                    ];

                                                                if (
                                                                    !classificacao
                                                                )
                                                                    return null;
                                                                return (
                                                                    <Badge
                                                                        key={ci}
                                                                        variant="secondary"
                                                                        className={cn(
                                                                            "gap-1 border-transparent font-normal",
                                                                            CORES_BADGE[
                                                                                classificacao
                                                                                    .cor
                                                                            ],
                                                                        )}
                                                                    >
                                                                        <span
                                                                            aria-hidden
                                                                        >
                                                                            {
                                                                                classificacao.icone
                                                                            }
                                                                        </span>
                                                                        <span>
                                                                            {
                                                                                classificacao.label
                                                                            }
                                                                        </span>
                                                                    </Badge>
                                                                );
                                                            },
                                                        )}
                                                </div>

                                                <p className="text-primary mt-2 text-lg font-bold">
                                                    + R${" "}
                                                    {converteReal(sabor.preco)}
                                                </p>
                                            </div>

                                            {/* Controles */}
                                            {(() => {
                                                const bloqueado =
                                                    item?.quantidade_sabor ===
                                                    item?.quantidade_sabores_selecionadas;
                                                return (
                                                    <ButtonGroup className="md:col-span-3">
                                                        <Button
                                                            className="cursor-pointer"
                                                            disabled={
                                                                sabor.quantidade ===
                                                                0
                                                            }
                                                            onClick={() =>
                                                                diminuiQtde(
                                                                    "sabor",
                                                                    undefined,
                                                                    undefined,
                                                                    idx,
                                                                )
                                                            }
                                                        >
                                                            <Minus />
                                                        </Button>
                                                        <Input
                                                            className="text-center"
                                                            value={
                                                                sabor.quantidade
                                                            }
                                                            disabled
                                                        />
                                                        <Button
                                                            className="cursor-pointer"
                                                            disabled={Boolean(
                                                                bloqueado,
                                                            )}
                                                            onClick={() =>
                                                                adicionaQtde(
                                                                    "sabor",
                                                                    undefined,
                                                                    undefined,
                                                                    idx,
                                                                )
                                                            }
                                                        >
                                                            <Plus />
                                                        </Button>
                                                    </ButtonGroup>
                                                );
                                            })()}
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {pendenciasDeItens.sabores && (
                                <p className="text-destructive text-sm font-normal">
                                    Faltam sabores a serem selecionados:{" "}
                                    {item?.quantidade_sabores_selecionadas} /{" "}
                                    {item?.quantidade_sabor}
                                </p>
                            )}

                            <Field>
                                <FieldLabel htmlFor="observacao">
                                    Observaoções (opcional)
                                </FieldLabel>
                                <Textarea
                                    id="observacao"
                                    name="observacao"
                                    value={item?.observacao}
                                    onChange={(e) =>
                                        adicionaObservacao(e.target.value)
                                    }
                                ></Textarea>
                            </Field>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex items-center gap-3">
                            <p className="font-semibold">Quantidade:</p>
                            <ButtonGroup className="w-full md:max-w-2/7">
                                <Button
                                    className="cursor-pointer"
                                    disabled={item?.quantidade === 1}
                                    onClick={() => diminuiQtde("item")}
                                >
                                    <Minus />
                                </Button>
                                <Input
                                    className="text-center"
                                    value={item?.quantidade}
                                    disabled
                                />
                                <Button
                                    className="cursor-pointer"
                                    onClick={() => adicionaQtde("item")}
                                >
                                    <Plus />
                                </Button>
                            </ButtonGroup>
                        </div>
                        <Button
                            onClick={() => adicionaItemCarrinho()}
                            size={"lg"}
                            className="w-full cursor-pointer bg-green-50 text-green-700 hover:bg-green-50/20 md:w-auto dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-950/20"
                        >
                            <ShoppingCart /> Adicionar R${" "}
                            {converteReal(item?.total)}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
