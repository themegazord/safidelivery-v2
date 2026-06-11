import { IItemPedido } from "@/types/cardapio-digital/item-pedido";
import { createContext } from "react";

type TFuncoesManipulaItensCarrinho = (item?: IItemPedido) => void

interface ICarrinhoContext {
  carrinho: (IItemPedido)[]
  adicionaItemCarrinho: TFuncoesManipulaItensCarrinho
  removeItemCarrinho: TFuncoesManipulaItensCarrinho
  diminuiItemCarrinho: TFuncoesManipulaItensCarrinho
}

export const CarrinhoContext = createContext<ICarrinhoContext>({
  carrinho: [],
  adicionaItemCarrinho: () => {},
  removeItemCarrinho: () => {},
  diminuiItemCarrinho: () => {},
})