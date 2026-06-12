import { IItemPedido, IItemPizza } from "@/types/cardapio-digital/item-pedido";
import { createContext } from "react";

type TFuncoesManipulaItensCarrinho = (item?: IItemPedido | IItemPizza) => void;

interface ICarrinhoContext {
    carrinho: (IItemPedido | IItemPizza)[];
    adicionaItemCarrinho: TFuncoesManipulaItensCarrinho;
    removeItemCarrinho: TFuncoesManipulaItensCarrinho;
    diminuiItemCarrinho: TFuncoesManipulaItensCarrinho;
}

export const CarrinhoContext = createContext<ICarrinhoContext>({
    carrinho: [],
    adicionaItemCarrinho: () => {},
    removeItemCarrinho: () => {},
    diminuiItemCarrinho: () => {},
});
