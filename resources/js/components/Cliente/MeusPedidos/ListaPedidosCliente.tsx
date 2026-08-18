import { PackageOpen } from "lucide-react";
import { IPedidoCliente } from "@/types/cliente/pedidos";
import CardPedidoCliente from "./CardPedidoCliente";

interface IProps {
    pedidos: IPedidoCliente[];
    timezone: string;
}

export default function ListaPedidosCliente({ pedidos, timezone }: IProps) {
    if (pedidos.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
                <PackageOpen className="size-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Nenhum pedido encontrado</p>
            </div>
        );
    }

    return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pedidos.map((pedido) => (
                <CardPedidoCliente key={pedido.id} pedido={pedido} timezone={timezone} />
            ))}
        </section>
    );
}
