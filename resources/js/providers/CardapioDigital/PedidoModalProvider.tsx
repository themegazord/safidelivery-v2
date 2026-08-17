import ModalItemCombo from "@/components/Empresa/CardapioDigital/Modais/ModalItemCombo";
import ModalItens from "@/components/Empresa/CardapioDigital/Modais/ModalItens";
import ModalItensPizza from "@/components/Empresa/CardapioDigital/Modais/ModalItensPizza";
import { CarrinhoContext } from "@/contexts/CardapioDigital/CarrinhoContext";
import {
    PedidoModalContext,
    TTipoModalPedido,
} from "@/contexts/CardapioDigital/PedidoModalContext";
import {
    IGrupoComplemento,
    IGrupoComplementoCombo,
    IGrupoItensCombo,
    IItemCombo,
    IItemPedido,
    IItemPizza,
} from "@/types/cardapio-digital/item-pedido";
import { ReactNode, useContext, useState } from "react";

export default function PedidoModalProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { adicionaItemCarrinho, atualizaItemCarrinho } =
        useContext(CarrinhoContext);

    const [openModalPedido, setOpenModalPedido] =
        useState<TTipoModalPedido>(null);
    const [itemModal, setItemModal] = useState<
        IItemPedido | IItemPizza | IItemCombo
    >();
    const [itemEditandoIdx, setItemEditandoIdx] = useState<number | null>(
        null,
    );
    const [grupoItensInvalidos, setGruposItensInvalidos] = useState<number[]>(
        [],
    );
    const [grupoComplementosInvalidos, setGrupoComplementoInvalidos] =
        useState<number[]>([]);
    const [pendenciaPizza, setPendenciaPizza] = useState<{
        massa: boolean;
        borda: boolean;
        sabores: boolean;
    }>({ massa: false, borda: false, sabores: false });

    function calculaTotal(item: IItemPedido | IItemPizza | IItemCombo): number {
        if ("grupo_complemento" in item) {
            const precoBase = Number(
                item.desconto ? item.valor_desconto : item.preco,
            );

            const totalComplementos = item.grupo_complemento.reduce(
                (acc, g) =>
                    acc +
                    g.complementos.reduce(
                        (soma, c) =>
                            soma +
                            item.quantidade * (c.quantidade * Number(c.preco)),
                        0,
                    ),
                0,
            );

            return item.quantidade * precoBase + totalComplementos;
        }

        if ("sabores" in item) {
            const totalSabores = item.sabores.reduce(
                (acc, sabor) => acc + sabor.quantidade * sabor.preco,
                0,
            );

            return (
                item.quantidade *
                (totalSabores +
                    (item.massaSelecionada?.preco ?? 0) +
                    (item.bordaSelecionada?.preco ?? 0))
            );
        }

        if ("grupos" in item) {
            const precoBase =
                item.tipo_preco === "preco_combo" ? item.preco_fixo : 0;

            const totalGrupos =
                item.tipo_preco === "preco_item"
                    ? item.grupos.reduce(
                          (acc, g) =>
                              acc +
                              g.itens.reduce(
                                  (soma, i) =>
                                      soma + i.quantidade * Number(i.preco),
                                  0,
                              ),
                          0,
                      )
                    : 0;

            const totalComplementos = Object.values(
                item.grupos_complemento,
            ).reduce(
                (acc, g) =>
                    acc +
                    Object.values(g.complementos).reduce(
                        (soma, c) => soma + c.quantidade * Number(c.preco),
                        0,
                    ),
                0,
            );

            return item.quantidade * (precoBase + totalGrupos + totalComplementos);
        }

        return 0;
    }

    function abrirItemNovo(
        item: IItemPedido | IItemPizza | IItemCombo,
        tipo: TTipoModalPedido,
    ) {
        setItemModal(item);
        setItemEditandoIdx(null);
        setGruposItensInvalidos([]);
        setGrupoComplementoInvalidos([]);
        setPendenciaPizza({ massa: false, borda: false, sabores: false });
        setOpenModalPedido(tipo);
    }

    function abrirEdicaoItem(
        item: IItemPedido | IItemPizza | IItemCombo,
        idx: number,
    ) {
        const copia: IItemPedido | IItemPizza | IItemCombo = JSON.parse(
            JSON.stringify(item),
        );

        setItemModal(copia);
        setItemEditandoIdx(idx);
        setGruposItensInvalidos([]);
        setGrupoComplementoInvalidos([]);
        setPendenciaPizza({ massa: false, borda: false, sabores: false });

        if ("grupo_complemento" in copia) setOpenModalPedido("item");
        else if ("sabores" in copia) setOpenModalPedido("pizza");
        else if ("grupos" in copia) setOpenModalPedido("combo");
    }

    function fecharModalPedido() {
        setOpenModalPedido(null);
        setItemEditandoIdx(null);
    }

    function adicionaQtde(
        alvo:
            | "item"
            | "complemento"
            | "sabor"
            | "itemCombo"
            | "complementoCombo",
        grupo_idx?: number,
        complemento_idx?: number,
        sabor_idx?: number,
        itemCombo_idx?: number,
        complementoCombo_idx?: number,
    ): void {
        setItemModal((prev) => {
            if (!prev) return prev;

            if (alvo === "item") {
                const atualizado = { ...prev, quantidade: prev.quantidade + 1 };
                return { ...atualizado, total: calculaTotal(atualizado) };
            }

            if ("grupo_complemento" in prev) {
                const grupos = prev.grupo_complemento.map((g, gi) => {
                    if (gi !== grupo_idx) return g;

                    const novosComplementos = g.complementos.map((c, ci) =>
                        ci === complemento_idx
                            ? { ...c, quantidade: c.quantidade + 1 }
                            : c,
                    );

                    const novoTotal = novosComplementos.reduce(
                        (acc, c) => acc + c.quantidade,
                        0,
                    );

                    return {
                        ...g,
                        complementos: novosComplementos,
                        bloqueado: novoTotal >= g.qtd_maxima,
                    };
                });

                const atualizado = { ...prev, grupo_complemento: grupos };
                return { ...atualizado, total: calculaTotal(atualizado) };
            }

            if ("sabores" in prev) {
                const sabores = prev.sabores.map((sabor, idx) => {
                    if (idx !== sabor_idx) return sabor;

                    return {
                        ...sabor,
                        quantidade: sabor.quantidade + 1,
                    };
                });

                const atualizado = { ...prev, sabores: sabores };
                const quantidadeSelecionadoRecalculado = atualizado.sabores.reduce(
                    (acc, sabor) => acc + sabor.quantidade,
                    0,
                );
                return {
                    ...atualizado,
                    total: calculaTotal(atualizado),
                    quantidade_sabores_selecionadas:
                        quantidadeSelecionadoRecalculado,
                };
            }

            if ("grupos" in prev) {
                if (itemCombo_idx !== undefined) {
                    const grupos = prev.grupos.map((g, gi) => {
                        if (gi !== grupo_idx) return g;

                        const novosItens = g.itens.map((c, ci) =>
                            ci === itemCombo_idx
                                ? { ...c, quantidade: c.quantidade + 1 }
                                : c,
                        );

                        const novoTotal = novosItens.reduce(
                            (acc, c) => acc + c.quantidade,
                            0,
                        );

                        return {
                            ...g,
                            itens: novosItens,
                            bloqueado: novoTotal >= g.qtd_maxima,
                        };
                    });
                    const atualizado = { ...prev, grupos };
                    return { ...atualizado, total: calculaTotal(atualizado) };
                }

                if (complementoCombo_idx !== undefined) {
                    const gruposComplemento = Object.fromEntries(
                        Object.entries(prev.grupos_complemento).map(
                            ([key, g], gi) => {
                                if (gi !== grupo_idx) return [key, g];

                                const novosComplementos = Object.fromEntries(
                                    Object.entries(g.complementos).map(
                                        ([ck, c], ci) => [
                                            ck,
                                            ci === complementoCombo_idx
                                                ? {
                                                      ...c,
                                                      quantidade:
                                                          c.quantidade + 1,
                                                  }
                                                : c,
                                        ],
                                    ),
                                );

                                const novoTotal = Object.values(
                                    novosComplementos,
                                ).reduce((acc, c) => acc + c.quantidade, 0);

                                return [
                                    key,
                                    {
                                        ...g,
                                        complementos: novosComplementos,
                                        bloqueado: novoTotal >= g.qtd_maxima,
                                    },
                                ];
                            },
                        ),
                    );
                    const atualizado = {
                        ...prev,
                        grupos_complemento: gruposComplemento,
                    };
                    return { ...atualizado, total: calculaTotal(atualizado) };
                }
            }
        });
    }

    function diminuiQtde(
        alvo:
            | "item"
            | "complemento"
            | "sabor"
            | "itemCombo"
            | "complementoCombo",
        grupo_idx?: number,
        complemento_idx?: number,
        sabor_idx?: number,
        itemCombo_idx?: number,
        complementoCombo_idx?: number,
    ): void {
        setItemModal((prev) => {
            if (!prev) return prev;

            if (alvo === "item") {
                const atualizado = {
                    ...prev,
                    quantidade: Math.max(1, prev.quantidade - 1),
                };
                return { ...atualizado, total: calculaTotal(atualizado) };
            }

            if ("grupo_complemento" in prev) {
                const grupos = prev.grupo_complemento.map((g, gi) => {
                    if (gi !== grupo_idx) return g;

                    const novosComplementos = g.complementos.map((c, ci) =>
                        ci === complemento_idx
                            ? { ...c, quantidade: c.quantidade - 1 }
                            : c,
                    );

                    return {
                        ...g,
                        complementos: novosComplementos,
                        bloqueado: false,
                    };
                });

                const atualizado = { ...prev, grupo_complemento: grupos };
                return { ...atualizado, total: calculaTotal(atualizado) };
            }

            if ("sabores" in prev) {
                const sabores = prev.sabores.map((sabor, idx) => {
                    if (idx !== sabor_idx) return sabor;

                    return {
                        ...sabor,
                        quantidade: sabor.quantidade - 1,
                    };
                });

                const atualizado = { ...prev, sabores: sabores };
                const quantidadeSelecionadoRecalculado = atualizado.sabores.reduce(
                    (acc, sabor) => acc + sabor.quantidade,
                    0,
                );
                return {
                    ...atualizado,
                    total: calculaTotal(atualizado),
                    quantidade_sabores_selecionadas:
                        quantidadeSelecionadoRecalculado,
                };
            }

            if ("grupos" in prev) {
                if (itemCombo_idx !== undefined) {
                    const grupos = prev.grupos.map((g, gi) => {
                        if (gi !== grupo_idx) return g;

                        const novosItens = g.itens.map((c, ci) =>
                            ci === itemCombo_idx
                                ? {
                                      ...c,
                                      quantidade: Math.max(0, c.quantidade - 1),
                                  }
                                : c,
                        );

                        const novoTotal = novosItens.reduce(
                            (acc, c) => acc + c.quantidade,
                            0,
                        );

                        return {
                            ...g,
                            itens: novosItens,
                            bloqueado: novoTotal >= g.qtd_maxima,
                        };
                    });
                    const atualizado = { ...prev, grupos };
                    return { ...atualizado, total: calculaTotal(atualizado) };
                }

                if (complementoCombo_idx !== undefined) {
                    const gruposComplemento = Object.fromEntries(
                        Object.entries(prev.grupos_complemento).map(
                            ([key, g], gi) => {
                                if (gi !== grupo_idx) return [key, g];

                                const novosComplementos = Object.fromEntries(
                                    Object.entries(g.complementos).map(
                                        ([ck, c], ci) => [
                                            ck,
                                            ci === complementoCombo_idx
                                                ? {
                                                      ...c,
                                                      quantidade: Math.max(
                                                          0,
                                                          c.quantidade - 1,
                                                      ),
                                                  }
                                                : c,
                                        ],
                                    ),
                                );

                                const novoTotal = Object.values(
                                    novosComplementos,
                                ).reduce((acc, c) => acc + c.quantidade, 0);

                                return [
                                    key,
                                    {
                                        ...g,
                                        complementos: novosComplementos,
                                        bloqueado: novoTotal >= g.qtd_maxima,
                                    },
                                ];
                            },
                        ),
                    );
                    const atualizado = {
                        ...prev,
                        grupos_complemento: gruposComplemento,
                    };
                    return { ...atualizado, total: calculaTotal(atualizado) };
                }
            }
        });
    }

    function adicionaObservacao(observacao: string): void {
        setItemModal((prev) => {
            if (!prev) return prev;
            return { ...prev, observacao: observacao };
        });
    }

    function defineMassaSelecionada(value: string): void {
        setItemModal((prev) => {
            if (!prev || !("sabores" in prev)) return prev;

            const atualizado = {
                ...prev,
                massaSelecionada: prev.massas.find(
                    (m) => m.id === Number(value),
                ),
            };
            return { ...atualizado, total: calculaTotal(atualizado) };
        });
    }

    function defineBordaSelecionada(value: string): void {
        setItemModal((prev) => {
            if (!prev || !("sabores" in prev)) return prev;

            const atualizado = {
                ...prev,
                bordaSelecionada: prev.bordas.find(
                    (b) => b.id === Number(value),
                ),
            };
            return { ...atualizado, total: calculaTotal(atualizado) };
        });
    }

    function grupoComplementoValido(
        grupoComplemento: IGrupoComplemento,
    ): boolean {
        if (Boolean(grupoComplemento.obrigatoriedade)) {
            return (
                grupoComplemento.complementos.reduce(
                    (acc, c) => acc + c.quantidade,
                    0,
                ) >= Math.max(1, grupoComplemento.qtd_minima)
            );
        }
        return true;
    }

    function grupoComplementoComboValido(
        grupoComplemento: IGrupoComplementoCombo,
    ): boolean {
        if (grupoComplemento.obrigatorio) {
            return (
                Object.values(grupoComplemento.complementos).reduce(
                    (acc, c) => acc + c.quantidade,
                    0,
                ) >= Math.max(1, grupoComplemento.qtd_minima)
            );
        }
        return true;
    }

    function grupoItemValido(grupoItem: IGrupoItensCombo): boolean {
        if (grupoItem.obrigatorio) {
            return (
                grupoItem.itens.reduce((acc, c) => acc + c.quantidade, 0) >=
                Math.max(1, grupoItem.qtd_minima)
            );
        }
        return true;
    }

    function confirmarItemModal() {
        if (!itemModal) return;

        if ("grupo_complemento" in itemModal) {
            const invalidos =
                itemModal?.grupo_complemento
                    .filter((grupo) => !grupoComplementoValido(grupo))
                    .map((grupo) => grupo.id) ?? [];

            setGrupoComplementoInvalidos(invalidos);

            if (invalidos.length > 0) return;
        }

        if ("sabores" in itemModal) {
            const invalidos = {
                massa: itemModal.massaSelecionada === null,
                borda: itemModal.bordaSelecionada === null,
                sabores:
                    itemModal.quantidade_sabores_selecionadas !==
                    itemModal.quantidade_sabor,
            };

            if (invalidos.massa || invalidos.borda || invalidos.sabores) {
                setPendenciaPizza(invalidos);
                return;
            }
        }

        if ("grupos" in itemModal) {
            const giInvalidos = itemModal.grupos
                .filter((gi) => !grupoItemValido(gi))
                .map((gi) => gi.id);

            const gcInvalidos = Object.values(itemModal.grupos_complemento)
                .filter((gc) => !grupoComplementoComboValido(gc))
                .map((gc) => gc.id);

            setGruposItensInvalidos(giInvalidos);
            setGrupoComplementoInvalidos(gcInvalidos);

            if (giInvalidos.length > 0 || gcInvalidos.length > 0) return;
        }

        if (itemEditandoIdx !== null) {
            atualizaItemCarrinho(itemEditandoIdx, itemModal);
        } else {
            adicionaItemCarrinho(itemModal);
        }

        setOpenModalPedido(null);
        setItemEditandoIdx(null);
    }

    const emEdicao = itemEditandoIdx !== null;

    return (
        <PedidoModalContext.Provider
            value={{
                itemModal,
                openModalPedido,
                emEdicao,
                grupoItensInvalidos,
                grupoComplementosInvalidos,
                pendenciaPizza,
                abrirItemNovo,
                abrirEdicaoItem,
                fecharModalPedido,
                adicionaQtde,
                diminuiQtde,
                adicionaObservacao,
                defineMassaSelecionada,
                defineBordaSelecionada,
                confirmarItemModal,
            }}
        >
            {children}
            <ModalItens
                item={
                    itemModal !== undefined && "grupo_complemento" in itemModal
                        ? itemModal
                        : undefined
                }
                open={openModalPedido === "item"}
                setOpen={fecharModalPedido}
                adicionaQtde={adicionaQtde}
                diminuiQtde={diminuiQtde}
                adicionaObservacao={adicionaObservacao}
                adicionaItemCarrinho={confirmarItemModal}
                gruposComplementosInvalidos={grupoComplementosInvalidos}
                emEdicao={emEdicao}
            />
            <ModalItensPizza
                item={
                    itemModal !== undefined && "sabores" in itemModal
                        ? itemModal
                        : undefined
                }
                open={openModalPedido === "pizza"}
                setOpen={fecharModalPedido}
                adicionaQtde={adicionaQtde}
                diminuiQtde={diminuiQtde}
                adicionaObservacao={adicionaObservacao}
                adicionaItemCarrinho={confirmarItemModal}
                defineBordaSelecionada={defineBordaSelecionada}
                defineMassaSelecionada={defineMassaSelecionada}
                pendenciasDeItens={pendenciaPizza}
                emEdicao={emEdicao}
            />
            <ModalItemCombo
                item={
                    itemModal !== undefined && "grupos" in itemModal
                        ? itemModal
                        : undefined
                }
                open={openModalPedido === "combo"}
                setOpen={fecharModalPedido}
                adicionaQtde={adicionaQtde}
                diminuiQtde={diminuiQtde}
                adicionaObservacao={adicionaObservacao}
                adicionaItemCarrinho={confirmarItemModal}
                gruposComplementosInvalidos={grupoComplementosInvalidos}
                grupoItensInvalidos={grupoItensInvalidos}
                emEdicao={emEdicao}
            />
        </PedidoModalContext.Provider>
    );
}
