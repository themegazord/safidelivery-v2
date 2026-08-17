import {
    IItemCombo,
    IItemPedido,
    IItemPizza,
    TManipulaPedidoItem,
} from "@/types/cardapio-digital/item-pedido";
import { createContext } from "react";

export type TTipoModalPedido = "item" | "combo" | "pizza" | null;

interface IPedidoModalContext {
    itemModal: IItemPedido | IItemPizza | IItemCombo | undefined;
    openModalPedido: TTipoModalPedido;
    emEdicao: boolean;
    grupoItensInvalidos: number[];
    grupoComplementosInvalidos: number[];
    pendenciaPizza: { massa: boolean; borda: boolean; sabores: boolean };
    abrirItemNovo: (
        item: IItemPedido | IItemPizza | IItemCombo,
        tipo: TTipoModalPedido,
    ) => void;
    abrirEdicaoItem: (
        item: IItemPedido | IItemPizza | IItemCombo,
        idx: number,
    ) => void;
    fecharModalPedido: (valor: null) => void;
    adicionaQtde: TManipulaPedidoItem;
    diminuiQtde: TManipulaPedidoItem;
    adicionaObservacao: (observacao: string) => void;
    defineMassaSelecionada: (value: string) => void;
    defineBordaSelecionada: (value: string) => void;
    confirmarItemModal: () => void;
}

export const PedidoModalContext = createContext<IPedidoModalContext>({
    itemModal: undefined,
    openModalPedido: null,
    emEdicao: false,
    grupoItensInvalidos: [],
    grupoComplementosInvalidos: [],
    pendenciaPizza: { massa: false, borda: false, sabores: false },
    abrirItemNovo: () => {},
    abrirEdicaoItem: () => {},
    fecharModalPedido: () => {},
    adicionaQtde: () => {},
    diminuiQtde: () => {},
    adicionaObservacao: () => {},
    defineMassaSelecionada: () => {},
    defineBordaSelecionada: () => {},
    confirmarItemModal: () => {},
});
