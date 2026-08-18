import { PackageOpen } from "lucide-react";
import { IPedidoCliente } from "@/types/cliente/pedidos";
import CardPedidoCliente from "./CardPedidoCliente";

interface IProps {
    pedidos: IPedidoCliente[];
}

export default function ListaPedidosCliente({ pedidos }: IProps) {
    if (pedidos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
                <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
                    <PackageOpen className="size-6" />
                </span>
                <div>
                    <p className="font-medium">Nenhum pedido encontrado</p>
                    <p className="text-muted-foreground text-sm">
                        Quando você fizer um pedido, ele aparece aqui.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {pedidos.map((pedido) => (
                <CardPedidoCliente key={pedido.id} pedido={pedido} />
            ))}
        </div>
    );
}
