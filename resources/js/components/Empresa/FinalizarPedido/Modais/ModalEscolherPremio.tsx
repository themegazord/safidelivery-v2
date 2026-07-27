import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Gift, ShoppingBag } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { converteReal } from "@/utils/utils";
import {
    IItemCombo,
    IItemPedido,
    IItemPizza,
} from "@/types/cardapio-digital/item-pedido";
import {
    IItemPremioDisponivel,
    IResgateFidelidade,
} from "@/types/finalizar-pedido/fidelidade";
import SelecaoPremioCombo from "./SelecaoPremioCombo";
import SelecaoPremioItemRegular from "./SelecaoPremioItemRegular";
import SelecaoPremioPizza from "./SelecaoPremioPizza";

interface IProps {
    aberto: boolean;
    onOpenChange: (aberto: boolean) => void;
    interacaoId: string;
    onConfirmar: (resgate: IResgateFidelidade) => void;
}

type Fase =
    | { nome: "lista" }
    | { nome: "item"; itemId: number }
    | { nome: "pizza"; tamanhoId: number }
    | { nome: "combo"; comboId: number };

export default function ModalEscolherPremio({
    aberto,
    onOpenChange,
    interacaoId,
    onConfirmar,
}: IProps) {
    const [fase, setFase] = useState<Fase>({ nome: "lista" });
    const [itens, setItens] = useState<IItemPremioDisponivel[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        if (!aberto) return;

        setFase({ nome: "lista" });
        setCarregando(true);

        axios
            .post(route("aplicacao.empresa.finalizar-pedido.itens-premio-fidelidade"), {
                interacao_id: interacaoId,
            })
            .then((response) => setItens(response.data.itens))
            .catch(() =>
                toast.error("Não foi possível carregar os prêmios disponíveis."),
            )
            .finally(() => setCarregando(false));
    }, [aberto, interacaoId]);

    function selecionaItem(item: IItemPremioDisponivel) {
        if (item.tipo === "I") {
            setFase({ nome: "item", itemId: item.id });
            return;
        }

        if (item.tipo === "P") {
            setFase({ nome: "pizza", tamanhoId: item.id });
            return;
        }

        setFase({ nome: "combo", comboId: item.id });
    }

    function confirmaItemRegular(item: IItemPedido) {
        onConfirmar({
            usar: true,
            item_id: item.id,
            tipo: "I",
            complementos: item.grupo_complemento.map((grupo) => ({
                complementos: Object.fromEntries(
                    grupo.complementos
                        .filter((c) => c.quantidade > 0)
                        .map((c) => [
                            c.id,
                            { nome: c.nome, preco: c.preco, qtde: c.quantidade },
                        ]),
                ),
            })),
        });
        setFase({ nome: "lista" });
        onOpenChange(false);
    }

    function confirmaPizza(pizza: IItemPizza) {
        onConfirmar({
            usar: true,
            tipo: "P",
            pizza_config: {
                tamanho_id: pizza.id,
                qtd_sabor: 1,
                itens: pizza.sabores.map((sabor) => ({
                    id: sabor.id,
                    nome: sabor.nome,
                    descricao: sabor.descricao,
                    preco_unitario: String(sabor.preco),
                    qtde_selecionada: sabor.quantidade,
                })),
                bordaSelecionada: pizza.bordaSelecionada?.id ?? null,
                massaSelecionada: pizza.massaSelecionada?.id ?? null,
            },
        });
        setFase({ nome: "lista" });
        onOpenChange(false);
    }

    function confirmaCombo(combo: IItemCombo) {
        onConfirmar({
            usar: true,
            tipo: "C",
            combo_config: {
                combo_id: combo.id,
                nome: combo.nome,
                tipo_preco: combo.tipo_preco,
                preco_fixo: combo.preco_fixo,
                grupos: Object.fromEntries(
                    combo.grupos.map((grupo) => [
                        grupo.id,
                        {
                            nome: grupo.nome,
                            itens: Object.fromEntries(
                                grupo.itens
                                    .filter((item) => item.quantidade > 0)
                                    .map((item) => [
                                        item.referencia_id,
                                        {
                                            nome: item.nome,
                                            preco: item.preco,
                                            qtde: item.quantidade,
                                        },
                                    ]),
                            ),
                        },
                    ]),
                ),
                grupos_complemento: Object.fromEntries(
                    Object.values(combo.grupos_complemento).map((gc) => [
                        gc.id,
                        {
                            nome: gc.nome,
                            complementos: Object.fromEntries(
                                Object.values(gc.complementos)
                                    .filter((c) => c.quantidade > 0)
                                    .map((c) => [
                                        c.referencia_id,
                                        { nome: c.nome, preco: c.preco, qtde: c.quantidade },
                                    ]),
                            ),
                        },
                    ]),
                ),
            },
        });
        setFase({ nome: "lista" });
        onOpenChange(false);
    }

    if (!aberto) {
        return null;
    }

    if (fase.nome === "item") {
        return (
            <SelecaoPremioItemRegular
                itemId={fase.itemId}
                onCancelar={() => setFase({ nome: "lista" })}
                onConfirmar={confirmaItemRegular}
            />
        );
    }

    if (fase.nome === "pizza") {
        return (
            <SelecaoPremioPizza
                tamanhoId={fase.tamanhoId}
                onCancelar={() => setFase({ nome: "lista" })}
                onConfirmar={confirmaPizza}
            />
        );
    }

    if (fase.nome === "combo") {
        return (
            <SelecaoPremioCombo
                comboId={fase.comboId}
                onCancelar={() => setFase({ nome: "lista" })}
                onConfirmar={confirmaCombo}
            />
        );
    }

    return (
        <Dialog open={aberto} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Gift className="size-4 text-primary" />
                        Escolha seu prêmio
                    </DialogTitle>
                    <DialogDescription>
                        Selecione um item entre os que você mais pediu
                    </DialogDescription>
                </DialogHeader>

                {carregando ? (
                    <div className="flex items-center justify-center p-8">
                        <Spinner />
                    </div>
                ) : itens.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        Nenhum item disponível para resgate no momento.
                    </p>
                ) : (
                    <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
                        {itens.map((item) => (
                            <button
                                key={`${item.tipo}-${item.id}`}
                                type="button"
                                onClick={() => selecionaItem(item)}
                                className="flex items-center gap-3 rounded-lg border-2 border-border px-4 py-3 text-left transition hover:border-primary/50 hover:bg-primary/5"
                            >
                                {item.imagem ? (
                                    <img
                                        src={item.imagem}
                                        alt=""
                                        className="size-12 shrink-0 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                                        <ShoppingBag className="size-5 text-muted-foreground" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium">{item.nome}</p>
                                    {item.preco !== null && (
                                        <p className="text-sm text-muted-foreground">
                                            R$ {converteReal(item.preco)}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
