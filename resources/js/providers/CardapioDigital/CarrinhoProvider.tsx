import { CarrinhoContext } from "@/contexts/CardapioDigital/CarrinhoContext";
import { IItemPedido } from "@/types/cardapio-digital/item-pedido";
import { ReactNode, useState } from "react";

export default function CarrinhoProvider({children}: {children: ReactNode}) {
  const [carrinho, setCarrinho] = useState<(IItemPedido)[]>([])
  return (
    <CarrinhoContext.Provider value={{
      carrinho: carrinho,
      adicionaItemCarrinho: () => {},
      removeItemCarrinho: () => {},
      diminuiItemCarrinho: () => {}
    }}>
      {children}
    </CarrinhoContext.Provider>
  )
}