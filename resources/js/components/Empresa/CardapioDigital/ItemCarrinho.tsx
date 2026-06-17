import { IItemCombo, IItemPedido, IItemPizza, ISabor } from "@/types/cardapio-digital/item-pedido"
import { converteReal } from "@/utils/utils"
import { ReactNode } from "react"
import ItemCarrinhoLayout from "./ItemCarrinhoLayout"

interface IProps {
  item: IItemPedido | IItemCombo | IItemPizza,
  idx: number,
}

export default function ItemCarrinho({item, idx}: IProps) {
  function saboresSelecionados(sabores: ISabor[]): Array<ISabor> {
    return sabores.filter(s => s.quantidade > 0);
  }
  return (
    <>
      {"grupo_complemento" in item && (
        <ItemCarrinhoLayout item={item} idx={idx}>
          <>
            {item.grupo_complemento.map((grupoComplemento, grupoIdx) => {
                const complementosSelecionados = grupoComplemento.complementos.filter(c => c.quantidade > 0)
                return (
                  <>
                    {complementosSelecionados.map((complemento, complementoIdx) => {
                      const totalComplemento = complemento.quantidade * Number(complemento.preco)
                      return (
                        <div className="flex items-center justify-between gap-2">
                          <span className="min-w-0 truncate">
                            <span className="opacity-60">{complemento.quantidade}x{" "}</span>{complemento.nome}
                          </span>
                          {Number(complemento.preco) > 0 && (
                            <span className="shrink-0 opacity-60">R$ {converteReal(totalComplemento)}</span>
                          )}
                        </div>
                      )
                    })}
                  </>
                )
              })}
          </>
        </ItemCarrinhoLayout>
      )}

      {"sabores" in item && (
        <ItemCarrinhoLayout item={item} idx={idx}>
          <>
            {item.bordaSelecionada !== undefined && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate">
                      <span className="opacity-60">Borda:</span>{" "}
                      {item.bordaSelecionada.nome}
                    </span>
                    <span className="shrink-0 opacity-60">+R$ {converteReal(Number(item.bordaSelecionada.preco))}</span>
                  </div>
                )}
                {item.massaSelecionada !== undefined && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate">
                      <span className="opacity-60">Massa:</span>{" "}
                      {item.massaSelecionada.nome}
                    </span>
                    <span className="shrink-0 opacity-60">+R$ {converteReal(Number(item.massaSelecionada.preco))}</span>
                  </div>
                )}
                {saboresSelecionados(item.sabores).map((sabor, idx) => (
                  <div className="flex items-center justify-between gap-2" key={idx}>
                    <span className="min-w-0 truncate">
                      <span className="opacity-60">{sabor.quantidade}x{" "}{sabor.nome}</span>
                    </span>
                    {sabor.preco > 0 && (
                      <span className="shrink-0 opacity-60">R$ {converteReal((sabor.quantidade * sabor.preco))}</span>
                    )}
                  </div>
                ))}
          </>
        </ItemCarrinhoLayout>
      )}
      
      {"grupos" in item && (
        <ItemCarrinhoLayout item={item} idx={idx}>
          {item.grupos.length > 0 && (
              <div className="mb-2 space-y-1 rounded bg-background/20 p-2 text-xs">
                {item.grupos.map((grupo, grupoIdx) => (
                  <div key={grupoIdx}>
                    {grupo.itens.filter(itemGrupo => itemGrupo.quantidade > 0).map((itemGrupo, idx) => (
                      <div className="flex items-center justify-between gap-2" key={idx}>
                        <span className="min-w-0 truncate"><span className="opacity-60">{itemGrupo.quantidade}x</span> {itemGrupo.nome}</span>
                        {itemGrupo.preco > 0 && item.tipo_preco === 'preco_itens' && (
                          <span className="shrink-0 opacity-60">R$ {converteReal((itemGrupo.quantidade * itemGrupo.preco))}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {Object.values(item.grupos_complemento).length > 0 && (
              <div className="mb-2 space-y-1 rounded bg-background/20 p-2 text-xs">
                {Object.entries(item.grupos_complemento).map(([grupoComplementoId, grupoComplemento], _) => (
                  <div key={grupoComplementoId}>
                    {Object.entries(grupoComplemento.complementos).filter(([complementoComboId, complementoCombo]) => complementoCombo.quantidade > 0).map(([complementoComboId, complementoCombo], complementoComboIdx) => (
                      <div className="flex items-center justify-between gap-2" key={complementoComboIdx}>
                        <span className="min-w-0 truncate"><span className="opacity-60">{complementoCombo.quantidade}x</span> {complementoCombo.nome}</span>
                        {complementoCombo.preco > 0 && (
                          <span className="shrink-0 opacity-60">R$ {converteReal((complementoCombo.quantidade * complementoCombo.preco))}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
        </ItemCarrinhoLayout>
      )}
    </>
  )
}