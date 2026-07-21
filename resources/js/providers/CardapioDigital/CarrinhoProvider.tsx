import { CarrinhoContext } from "@/contexts/CardapioDigital/CarrinhoContext";
import {
    IGrupoComplemento,
    IGrupoComplementoCombo,
    IGrupoItensCombo,
    IItemCombo,
    IItemPedido,
    IItemPizza,
    ISabor,
} from "@/types/cardapio-digital/item-pedido";
import { usePage } from "@inertiajs/react";
import { ReactNode, useEffect, useMemo, useState } from "react";

export default function CarrinhoProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { tipo_funcionamento } = usePage<{ tipo_funcionamento: 'delivery' | 'mesa' | undefined }>().props;

    const [carrinho, setCarrinho] = useState<
        (IItemPedido | IItemPizza | IItemCombo)[]
    >(() => {
        try {
            const salvo = localStorage.getItem(`carrinho-${tipo_funcionamento}`);
            return salvo ? JSON.parse(salvo) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(`carrinho-${tipo_funcionamento}`, JSON.stringify(carrinho));
    }, [carrinho]);

    const subtotal = useMemo(() => {
        return carrinho.reduce((acc, item) => acc + (item.quantidade * item.total), 0)
    }, [carrinho])

    const [total, setTotal] = useState(0);

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

    function saboresSaoIguais(
        sabores1: ISabor[],
        sabores2: ISabor[],
    ): boolean {
        const normaliza = (sabores: ISabor[]) =>
            [...sabores]
                .sort((a, b) => a.id - b.id)
                .map((s) => ({ ...s }));

        return (
            JSON.stringify(normaliza(sabores1)) ===
            JSON.stringify(normaliza(sabores2))
        );
    }

    function grupoItemSaoIguais(
        grupoItem1: IGrupoItensCombo[],
        grupoItem2: IGrupoItensCombo[]
    ): boolean {
        const normaliza = (grupos: IGrupoItensCombo[]) =>
        [...grupos]
            .sort((a, b) => a.id - b.id)
            .map((g) => ({
                ...g,
                itens: [...g.itens].sort(
                    (a, b) => a.referencia_id - b.referencia_id
                )
            }))

        return (
            JSON.stringify(normaliza(grupoItem1)) === JSON.stringify(normaliza(grupoItem2))
        )
    }

    function grupoComplementoItemSaoIguais(
        grupoComplemento1: IGrupoComplementoCombo[],
        grupoComplemento2: IGrupoComplementoCombo[]
    ): boolean {
        const normaliza = (grupos: IGrupoComplementoCombo[]) =>
            [...grupos]
                .sort((a, b) => a.id - b.id)
                .map((g) => ({
                    ...g,
                    complementos: Object.values(g.complementos).sort(
                        (a, b) => a.referencia_id - b.referencia_id
                    ),
                }));

        return (
            JSON.stringify(normaliza(grupoComplemento1)) ===
            JSON.stringify(normaliza(grupoComplemento2))
        );
    }

    function adicionaItemCarrinho(
        item?: IItemPedido | IItemPizza | IItemCombo,
    ) {
        if (!item) return;

        if ("grupo_complemento" in item) {
            const itemExistente = carrinho.find((i) => {
                if (!("grupo_complemento" in i)) return false;
                return (
                    i.id === item.id &&
                    i.observacao?.trim().toLowerCase() ===
                        item.observacao?.trim().toLowerCase() &&
                    grupoComplementoSaoIguais(
                        i.grupo_complemento,
                        item.grupo_complemento,
                    )
                );
            });

            if (itemExistente) {
                console.log('item existente aqui')
                setCarrinho((prev) =>
                    prev.map((i) =>
                        i === itemExistente
                            ? { ...i, quantidade: item.quantidade + i.quantidade }
                            : i,
                    ),
                );
            } else {
                setCarrinho((prev) => [...prev, { ...item }]);
            }
        }

        if ("sabores" in item) {
            const itemExistente = carrinho.find((i) => {
                if (!("sabores" in i)) return false;
                return (
                    i.id === item.id &&
                    i.observacao?.trim().toLowerCase() ===
                        item.observacao?.trim().toLowerCase() &&
                    JSON.stringify(i.massaSelecionada) ===
                        JSON.stringify(item.massaSelecionada) &&
                    JSON.stringify(i.bordaSelecionada) ===
                        JSON.stringify(item.bordaSelecionada) &&
                    saboresSaoIguais(i.sabores, item.sabores)
                );
            });

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

        if ("grupos" in item) {
            const itemExistente = carrinho.find((i) => {
                if (!("grupos" in i)) return false;
                return (
                    i.id === item.id &&
                    i.observacao?.trim().toLowerCase() ===
                        item.observacao?.trim().toLowerCase() &&
                    grupoItemSaoIguais(item.grupos, i.grupos) &&
                    grupoComplementoItemSaoIguais(
                        Object.values(item.grupos_complemento),
                        Object.values(i.grupos_complemento),
                    )
                );
            });

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
    }

    function calculaTotal(frete: number | null, desconto: number | null) {
        setTotal(subtotal + (frete ?? 0) - (desconto ?? 0))
    }

    return (
        <CarrinhoContext.Provider
            value={{
                carrinho: carrinho,
                subtotal: subtotal,
                total: total,
                tipo_funcionamento: tipo_funcionamento,
                adicionaItemCarrinho: adicionaItemCarrinho,
                calculaTotal: calculaTotal,
                removeItemCarrinho: () => {},
                diminuiItemCarrinho: () => {},
            }}
        >
            {children}
        </CarrinhoContext.Provider>
    );
}
