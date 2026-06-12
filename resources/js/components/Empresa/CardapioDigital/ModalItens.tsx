import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { H4, H6 } from "@/components/utils/Heading";
import { cn } from "@/lib/utils";
import { IItemPedido } from "@/types/cardapio-digital/item-pedido";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface IProps {
    item?: IItemPedido;
    open: boolean;
    setOpen: (valor: null) => void;
    adicionaQtde: (
        alvo: "item" | "complemento",
        grupo_idx?: number,
        complemento_idx?: number,
    ) => void;
    diminuiQtde: (
        alvo: "item" | "complemento",
        grupo_idx?: number,
        complemento_idx?: number,
    ) => void;
    adicionaObservacao: (observacao: string) => void;
    adicionaItemCarrinho: () => void;
    gruposComplementosInvalidos: number[];
}

export default function ModalItens({
    item,
    open,
    setOpen,
    adicionaQtde,
    diminuiQtde,
    adicionaObservacao,
    adicionaItemCarrinho,
    gruposComplementosInvalidos,
}: IProps) {
    function converteReal(valor?: number | string) {
        return Number(valor).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }
    return (
        <Dialog open={open} onOpenChange={() => setOpen(null)}>
            <DialogContent
                className="flex max-h-[90dvh] w-11/12 flex-col overflow-hidden md:block md:max-h-none md:max-w-5xl md:overflow-visible"
                aria-describedby={undefined}
            >
                <DialogHeader className="shrink-0 md:shrink">
                    <DialogTitle>{item?.nome}</DialogTitle>
                </DialogHeader>
                <div className="my-4 flex min-h-0 flex-1 flex-col gap-6 md:grid md:min-h-fit md:flex-none md:grid-cols-2">
                    <div className="flex h-48 w-full shrink-0 items-center justify-center overflow-hidden md:h-96">
                        <img
                            src={item?.imagem}
                            alt={`Imagem do produto ${item?.nome}`}
                            className="h-full w-full rounded-xl object-cover"
                        />
                    </div>
                    <div className="min-h-0 w-full flex-1 space-y-4 overflow-y-auto pr-1 pb-2 md:max-h-96">
                        {(item?.descricao?.trim().length ?? 0 > 0) && (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm">Descrição do item:</p>
                                <p className="text-foreground mb-4">
                                    {item?.descricao}
                                </p>
                            </div>
                        )}
                        <div className="mb-4">
                            {Boolean(item?.desconto) ? (
                                <span className="flex items-center gap-2">
                                    <H4 className="font-bold text-green-500">
                                        R$ {converteReal(item?.valor_desconto)}
                                    </H4>
                                    <H6 className="text-gray-400 line-through">
                                        R$ {converteReal(item?.preco)}
                                    </H6>
                                    <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                        Desconto
                                    </Badge>
                                </span>
                            ) : (
                                <H4 className="font-bold text-green-500">
                                    R$ {converteReal(item?.preco)}
                                </H4>
                            )}
                        </div>
                        {item?.grupo_complemento.map((grupo, grupoIdx) => (
                            <Card
                                className={cn(
                                    "mb-4 w-full",
                                    gruposComplementosInvalidos.includes(
                                        grupo.id,
                                    )
                                        ? "border border-red-500"
                                        : "",
                                )}
                                key={grupoIdx}
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>{grupo.nome}</CardTitle>
                                        {Boolean(grupo.obrigatoriedade) ? (
                                            <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                                                Obrigatório
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                                Opcional
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription>{`Escolha ${Boolean(grupo.obrigatoriedade) ? "até" : ""} ${grupo.qtd_maxima > 1 ? grupo.qtd_maxima + " opções" : grupo.qtd_maxima + " opção"} `}</CardDescription>
                                </CardHeader>
                                <Separator />
                                <CardContent>
                                    {grupo.complementos.map(
                                        (complemento, cIdx) => (
                                            <div
                                                className="hover:bg-background/20 mb-2 flex items-center justify-between rounded-lg p-2"
                                                key={cIdx}
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        {complemento.nome}
                                                    </p>
                                                    <p className="text-foreground text-sm font-bold">
                                                        + R${" "}
                                                        {converteReal(
                                                            complemento.preco,
                                                        )}
                                                    </p>
                                                </div>
                                                <ButtonGroup className="max-w-1/2 md:max-w-2/7">
                                                    <Button
                                                        className="cursor-pointer"
                                                        disabled={
                                                            complemento.quantidade ===
                                                            0
                                                        }
                                                        onClick={() =>
                                                            diminuiQtde(
                                                                "complemento",
                                                                grupoIdx,
                                                                cIdx,
                                                            )
                                                        }
                                                    >
                                                        <Minus />
                                                    </Button>
                                                    <Input
                                                        className="text-center"
                                                        value={
                                                            complemento.quantidade
                                                        }
                                                        disabled
                                                    />
                                                    <Button
                                                        className="cursor-pointer"
                                                        disabled={Boolean(
                                                            grupo.bloqueado,
                                                        )}
                                                        onClick={() =>
                                                            adicionaQtde(
                                                                "complemento",
                                                                grupoIdx,
                                                                cIdx,
                                                            )
                                                        }
                                                    >
                                                        <Plus />
                                                    </Button>
                                                </ButtonGroup>
                                            </div>
                                        ),
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                        <Field>
                            <FieldLabel htmlFor="observacao">
                                Observação do pedido (opcional):{" "}
                            </FieldLabel>
                            <Textarea
                                id="observacao"
                                name="observacao"
                                value={item?.observacao}
                                onChange={(e) =>
                                    adicionaObservacao(e.target.value)
                                }
                            />
                        </Field>
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
