import {
    IItemCombo,
    TManipulaPedidoItem,
} from "@/types/cardapio-digital/item-pedido";
import LayoutModalItem from "./LayoutModalItem";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface IProps {
    item?: IItemCombo;
    open: boolean;
    setOpen: (valor: null) => void;
    adicionaQtde: TManipulaPedidoItem;
    diminuiQtde: TManipulaPedidoItem;
    adicionaObservacao: (observacao: string) => void;
    adicionaItemCarrinho: () => void;
    gruposComplementosInvalidos: number[];
    grupoItensInvalidos: number[];
}

export default function ModalItemCombo({
    item,
    open,
    setOpen,
    adicionaQtde,
    diminuiQtde,
    adicionaObservacao,
    adicionaItemCarrinho,
    gruposComplementosInvalidos,
    grupoItensInvalidos,
}: IProps) {
    function converteReal(valor?: number | string) {
        return Number(valor).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }
    return (
        <LayoutModalItem
            open={open}
            setOpen={setOpen}
            adicionaItemCarrinho={adicionaItemCarrinho}
            adicionaObservacao={adicionaObservacao}
            adicionaQtde={adicionaQtde}
            diminuiQtde={diminuiQtde}
            item={item}
        >
            {item?.grupos.map((grupo, grupoIdx) => (
                <Card key={grupoIdx} className="m-4">
                    <CardHeader>
                        <CardTitle className="flex w-full items-center justify-between">
                            <span>{grupo.nome}</span>
                            <Badge
                                className={cn(
                                    grupo.obrigatorio
                                        ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                                        : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                                )}
                            >
                                {grupo.obrigatorio ? "Obrigatório" : "Opcional"}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Escolha pelo menos {grupo.qtd_minima} e até{" "}
                            {grupo.qtd_maxima}{" "}
                            {grupo.qtd_maxima > 1 ? "itens" : "item"}.
                        </CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent>
                        {grupo.itens.map((itens, itensIdx) => (
                            <div className="hover:bg-background/20 flex items-center justify-between rounded-lg p-2">
                                <div>
                                    <p className="font-medium">{item.nome}</p>
                                    {item.tipo_preco === "preco_itens" &&
                                        item.preco_unitario > 0 && (
                                            <p className="text-primary text-sm font-bold">
                                                R${" "}
                                                {converteReal(
                                                    item.preco_unitario,
                                                )}
                                            </p>
                                        )}
                                </div>
                                <ButtonGroup className="max-w-1/2 md:max-w-2/7">
                                    <Button
                                        className="cursor-pointer"
                                        disabled={itens.quantidade === 0}
                                        onClick={() =>
                                            diminuiQtde(
                                                "itemCombo",
                                                undefined,
                                                undefined,
                                                undefined,
                                                itensIdx
                                            )
                                        }
                                    >
                                        <Minus />
                                    </Button>
                                    <Input
                                        className="text-center"
                                        value={itens.quantidade}
                                        disabled
                                    />
                                    <Button
                                        className="cursor-pointer"
                                        disabled={Boolean(grupo.bloqueado)}
                                        onClick={() =>
                                            adicionaQtde(
                                                "itemCombo",
                                                undefined,
                                                undefined,
                                                undefined,
                                                itensIdx
                                            )
                                        }
                                    >
                                        <Plus />
                                    </Button>
                                </ButtonGroup>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            {item &&
                Object.values(item.grupos_complemento).map(
                    (_grupoComplemento, gcIdx) => (
                        <div key={gcIdx}></div>
                    ),
                )}
        </LayoutModalItem>
    );
}
