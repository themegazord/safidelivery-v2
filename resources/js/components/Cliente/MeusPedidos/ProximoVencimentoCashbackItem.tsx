import { Banknote } from "lucide-react";
import { IProximoVencimentoCashback } from "@/types/cliente/pedidos";
import { converteReal } from "@/utils/utils";
import { formatarData } from "@/utils/pedidos";
import { diasParaVencer } from "@/utils/pedidosCliente";

interface IProps {
    credito: IProximoVencimentoCashback;
}

export default function ProximoVencimentoCashbackItem({ credito }: IProps) {
    const dias = diasParaVencer(credito.data_vencimento);

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm">
            <div className="flex items-center gap-2">
                <Banknote className="size-4 shrink-0 text-emerald-600" />
                <span className="font-medium text-emerald-600">R$ {converteReal(credito.saldo_restante)}</span>
                {credito.pedido_id && (
                    <span className="text-xs text-muted-foreground">· Pedido #{credito.pedido_id}</span>
                )}
            </div>
            <div className="text-right">
                <p className="text-xs text-muted-foreground">Vence em</p>
                <p className={`text-xs font-medium ${dias <= 7 ? "text-amber-600" : "text-foreground/70"}`}>
                    {formatarData(credito.data_vencimento, credito.timezone)}
                </p>
            </div>
        </div>
    );
}
