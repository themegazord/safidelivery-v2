import { Hand, ShoppingBag, Table2, Truck } from "lucide-react";
import { TTipoPedido } from "@/types/empresa/pedidos/types";

interface IProps {
    tipo: TTipoPedido;
    ehIfood: boolean;
    className?: string;
}

export default function TipoPedidoIcon({ tipo, ehIfood, className }: IProps) {
    if (tipo === "D") {
        return ehIfood ? <ShoppingBag className={className} /> : <Truck className={className} />;
    }
    if (tipo === "M") {
        return <Table2 className={className} />;
    }
    return <Hand className={className} />;
}
