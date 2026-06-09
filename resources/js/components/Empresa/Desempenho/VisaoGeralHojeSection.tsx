import { H2 } from "@/components/utils/Heading";
import Stats from "@/components/utils/Stats";
import { IFinanceiroPedidos, IPedido } from "@/types/desempenho";
import { CheckCircle, Clock, DollarSign, Flame, Truck } from "lucide-react";

interface IProps {
  financeiroPedidosHoje: IFinanceiroPedidos[],
  pedidosHoje: IPedido[]
}

export default function VisaoGeralHojeSection({financeiroPedidosHoje, pedidosHoje}: IProps) {
    return (
        <section className="flex flex-col gap-4 mb-8">
            <H2 className="flex gap-2 items-center">
                <>
                    <Clock />
                    Hoje
                </>
            </H2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Stats
                    title="Faturamento"
                    value={financeiroPedidosHoje.reduce(
                        (acc, sum) => acc + (sum.total ?? 0),
                        0,
                    )}
                    icon={<DollarSign />}
                    color="green"
                    isMoney
                />
                <Stats
                    title="Pedidos entregues"
                    value={
                        pedidosHoje.filter((pedido) =>
                            ["entregue"].includes(pedido.status),
                        ).length
                    }
                    icon={<CheckCircle />}
                    color="blue"
                />
                <Stats
                    title="Em produção"
                    value={
                        pedidosHoje.filter((pedido) =>
                            [
                                "pendente",
                                "sendo preparado",
                                "pedido feito",
                            ].includes(pedido.status),
                        ).length
                    }
                    icon={<Flame />}
                    color="amber"
                />
                <Stats
                    title="Em entrega"
                    value={
                        pedidosHoje.filter(
                            (pedido) =>
                                pedido.tipo === "D" &&
                                [
                                    "sendo entregue",
                                    "pronto para entrega",
                                ].includes(pedido.status),
                        ).length
                    }
                    icon={<Truck />}
                    color="purple"
                />
            </div>
        </section>
    );
}
