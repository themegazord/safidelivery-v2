import { Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { IFidelidadeResumoItem } from "@/types/cliente/pedidos";
import { converteReal } from "@/utils/utils";
import { formatarData } from "@/utils/pedidos";

interface IProps {
    item: IFidelidadeResumoItem;
}

function textoRecompensa(item: IFidelidadeResumoItem): string {
    switch (item.tipo_recompensa) {
        case "desconto_percentual":
            return `${item.valor_recompensa}% de desconto no próximo pedido`;
        case "desconto_fixo":
            return `R$ ${converteReal(item.valor_recompensa)} de desconto`;
        case "item_gratis":
            return "Item grátis liberado!";
        case "frete_gratis":
            return "Frete grátis liberado!";
        default:
            return "Recompensa liberada!";
    }
}

export default function ItemFidelidadeResumo({ item }: IProps) {
    return (
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{item.empresa_nome}</p>
                {item.recompensa_disponivel && (
                    <Badge className="gap-1 bg-emerald-600 text-white">
                        <Gift className="size-3" />
                        Recompensa disponível!
                    </Badge>
                )}
            </div>

            {item.recompensa_disponivel ? (
                <div className="rounded-lg bg-emerald-600/10 p-2.5 text-center text-sm">
                    <p className="font-medium text-emerald-600">{textoRecompensa(item)}</p>
                    {item.recompensa_expira_em && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Válido até {formatarData(item.recompensa_expira_em, item.timezone)}
                        </p>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {item.tipo_gatilho === "qtd_pedidos" ? (
                            <span>
                                {item.contador_atual} / {Math.trunc(item.valor_gatilho)} pedidos
                            </span>
                        ) : (
                            <span>
                                R$ {converteReal(item.valor_acumulado)} / R$ {converteReal(item.valor_gatilho)}
                            </span>
                        )}
                        <span>{item.percentual}%</span>
                    </div>
                    <Progress value={item.percentual} />
                    {item.percentual >= 70 && (
                        <p className="text-xs text-amber-600">Quase lá! Falta pouco para sua recompensa 🔥</p>
                    )}
                </div>
            )}
        </div>
    );
}
