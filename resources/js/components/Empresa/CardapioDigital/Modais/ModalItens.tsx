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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { H4, H6 } from "@/components/utils/Heading";
import { cn } from "@/lib/utils";
import {
    IItemPedido,
    TManipulaPedidoItem,
} from "@/types/cardapio-digital/item-pedido";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import LayoutModalItem from "./LayoutModalItem";

interface IProps {
    item?: IItemPedido;
    open: boolean;
    setOpen: (valor: null) => void;
    adicionaQtde: TManipulaPedidoItem;
    diminuiQtde: TManipulaPedidoItem;
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
        <LayoutModalItem
            open={open}
            setOpen={setOpen}
            adicionaItemCarrinho={adicionaItemCarrinho}
            adicionaObservacao={adicionaObservacao}
            adicionaQtde={adicionaQtde}
            diminuiQtde={diminuiQtde}
            item={item}
        >
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
                        gruposComplementosInvalidos.includes(grupo.id)
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
                        {grupo.complementos.map((complemento, cIdx) => (
                            <div
                                className="hover:bg-background/20 mb-2 flex items-center justify-between rounded-lg p-2"
                                key={cIdx}
                            >
                                <div>
                                    <p className="font-medium">
                                        {complemento.nome}
                                    </p>
                                    <p className="text-foreground text-sm font-bold">
                                        + R$ {converteReal(complemento.preco)}
                                    </p>
                                </div>
                                <ButtonGroup className="max-w-1/2 md:max-w-2/7">
                                    <Button
                                        className="cursor-pointer"
                                        disabled={complemento.quantidade === 0}
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
                                        value={complemento.quantidade}
                                        disabled
                                    />
                                    <Button
                                        className="cursor-pointer"
                                        disabled={Boolean(grupo.bloqueado)}
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
                        ))}
                    </CardContent>
                </Card>
            ))}
        </LayoutModalItem>
    );
}
