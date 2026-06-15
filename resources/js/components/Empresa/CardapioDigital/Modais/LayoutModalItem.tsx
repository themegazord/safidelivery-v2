import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    IItemCombo,
    IItemPedido,
    TManipulaPedidoItem,
} from "@/types/cardapio-digital/item-pedido";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { ReactNode } from "react";

interface IProps {
    children: ReactNode;
    item?: IItemPedido | IItemCombo;
    open: boolean;
    setOpen: (valor: null) => void;
    adicionaQtde: TManipulaPedidoItem;
    diminuiQtde: TManipulaPedidoItem;
    adicionaObservacao: (observacao: string) => void;
    adicionaItemCarrinho: () => void;
}

export default function LayoutModalItem({
    children,
    item,
    open,
    setOpen,
    adicionaQtde,
    diminuiQtde,
    adicionaObservacao,
    adicionaItemCarrinho,
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
                        {children}
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
                            {converteReal(item && "grupos" in item ? item.preco_fixo : item?.total)}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
