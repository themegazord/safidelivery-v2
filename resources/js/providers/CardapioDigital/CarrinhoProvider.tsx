import { CarrinhoContext } from "@/contexts/CardapioDigital/CarrinhoContext";
import {
    IGrupoComplemento,
    IItemPedido,
} from "@/types/cardapio-digital/item-pedido";
import { ReactNode, useState } from "react";

export default function CarrinhoProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [carrinho, setCarrinho] = useState<IItemPedido[]>([]);

    function grupoComplementoSaoIguais(
        grupo1: IGrupoComplemento[],
        grupo2: IGrupoComplemento[],
    ): boolean {
        const normaliza = (grupos: IGrupoComplemento[]) =>
            [...grupos]
                .sort((a, b) => a.id - b.id)
                .map((g) => ({
                    ...g,
                    complementos: [...g.complementos].sort(
                        (a, b) => a.id - b.id,
                    ),
                }));

        return (
            JSON.stringify(normaliza(grupo1)) ===
            JSON.stringify(normaliza(grupo2))
        );
    }

    function adicionaItemCarrinho(item?: IItemPedido) {
        if (!item) return;

        const itemExistente = carrinho.find(
            (i) =>
                i.id === item.id &&
                grupoComplementoSaoIguais(
                    i.grupo_complemento,
                    item.grupo_complemento,
                ) &&
                i.observacao?.trim().toLowerCase() ===
                    item.observacao?.trim().toLowerCase(),
        );

        if (itemExistente) {
            setCarrinho((prev) =>
                prev.map((i) =>
                    i === itemExistente
                        ? { ...i, quantidade: i.quantidade + 1 }
                        : i,
                ),
            );
        } else {
            setCarrinho((prev) => [...prev, { ...item }]);
        }
    }

    return (
        <CarrinhoContext.Provider
            value={{
                carrinho: carrinho,
                adicionaItemCarrinho: adicionaItemCarrinho,
                removeItemCarrinho: () => {},
                diminuiItemCarrinho: () => {},
            }}
        >
            {children}
        </CarrinhoContext.Provider>
    );
}
