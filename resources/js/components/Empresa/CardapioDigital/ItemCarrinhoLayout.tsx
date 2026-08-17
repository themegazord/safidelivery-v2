import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CarrinhoContext } from "@/contexts/CardapioDigital/CarrinhoContext"
import { PedidoModalContext } from "@/contexts/CardapioDigital/PedidoModalContext"
import { IItemCombo, IItemPedido, IItemPizza } from "@/types/cardapio-digital/item-pedido"
import { converteReal } from "@/utils/utils"
import { Edit, Trash } from "lucide-react"
import { ReactNode, useContext } from "react"

interface IProps {
  item: IItemPedido | IItemCombo | IItemPizza,
  idx: number,
  children: ReactNode,
  lista: boolean
}

export default function ItemCarrinhoLayout({item, idx, children, lista}: IProps) {
  const { removeItemCarrinho } = useContext(CarrinhoContext);
  const { abrirEdicaoItem } = useContext(PedidoModalContext);

  return (
    <Card>
      <CardHeader>
            <CardTitle className="flex justify-between">
              <span>{item.categoria.nome}</span>
              <span>R$ {"grupos" in item ? converteReal(item.total / item.quantidade) : "grupo_complemento" in item ? converteReal(item.preco_unitario) : ''}</span>
            </CardTitle>
            {"sabores" in item ? (
              <CardDescription>
                {item.quantidade}x  {`${item?.nome.toUpperCase()} (${item?.qtde_pedacos ?? 1} ${(item?.qtde_pedacos ?? 1) > 1 ? "PEDAÇOS" : "PEDAÇO"})`}
              </CardDescription>
            ) : (
              <CardDescription>{item.quantidade}x {item.nome}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="mb-2 space-y-1 rounded bg-background/20 p-2 text-xs">
              {children}
              {!lista && (
                <div className="flex gap-2">
                  <Button
                    className="flex-1 cursor-pointer bg-sky-100 text-sky-700 hover:bg-sky-200 hover:text-sky-800 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25 dark:hover:text-sky-200"
                    onClick={() => abrirEdicaoItem(item, idx)}
                  >
                    {<Edit />}{" "}Editar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 cursor-pointer"
                    onClick={() => removeItemCarrinho(item)}
                  >
                    {<Trash />}{" "}Remover
                  </Button>
                </div> 
              )} 
            </div>
          </CardContent>
    </Card>
  )
}