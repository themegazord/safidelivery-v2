import { IItemCombo, IItemPedido, IItemPizza } from "@/types/cardapio-digital/item-pedido";
import { createContext } from "react";

type TFuncoesManipulaItensCarrinho = (item?: IItemPedido | IItemPizza | IItemCombo) => void;

interface ICarrinhoContext {
    carrinho: (IItemPedido | IItemPizza | IItemCombo)[];
    subtotal: number,
    total: number,
    tipo_funcionamento: 'delivery' | 'mesa' | undefined,
    calculaTotal: (frete: number | null, desconto: number | null) => void ;
    adicionaItemCarrinho: TFuncoesManipulaItensCarrinho;
    removeItemCarrinho: TFuncoesManipulaItensCarrinho;
    diminuiItemCarrinho: TFuncoesManipulaItensCarrinho;
    atualizaItemCarrinho: (idx: number, item: IItemPedido | IItemPizza | IItemCombo) => void;
    limparCarrinho: () => void;
}

export const CarrinhoContext = createContext<ICarrinhoContext>({
    carrinho: [],
    subtotal: 0,
    total: 0,
    tipo_funcionamento: undefined,
    calculaTotal: () => {},
    adicionaItemCarrinho: () => {},
    removeItemCarrinho: () => {},
    diminuiItemCarrinho: () => {},
    atualizaItemCarrinho: () => {},
    limparCarrinho: () => {},
});
