import { IItemCombo, IItemPedido, IItemPizza } from "@/types/cardapio-digital/item-pedido";
import { createContext } from "react";

type TFuncoesManipulaItensCarrinho = (item?: IItemPedido | IItemPizza | IItemCombo) => void;

interface ICarrinhoContext {
    carrinho: (IItemPedido | IItemPizza | IItemCombo)[];
    total: number,
    tipo_funcionamento: 'delivery' | 'mesa' | undefined,
    adicionaItemCarrinho: TFuncoesManipulaItensCarrinho;
    removeItemCarrinho: TFuncoesManipulaItensCarrinho;
    diminuiItemCarrinho: TFuncoesManipulaItensCarrinho;
}

export const CarrinhoContext = createContext<ICarrinhoContext>({
    carrinho: [],
    total: 0,
    tipo_funcionamento: undefined, 
    adicionaItemCarrinho: () => {},
    removeItemCarrinho: () => {},
    diminuiItemCarrinho: () => {},
});
