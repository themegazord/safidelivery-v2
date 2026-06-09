import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricasDesempenho } from "@/types/desempenho";

interface IProps {
  metricas: MetricasDesempenho | undefined
}

export default function OrigemPedidosGrafico({metricas}: IProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Origem dos pedidos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex h-48 items-center justify-around">
                    <div className="flex flex-col items-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
                            <span className="text-2xl font-bold text-orange-500">
                                {metricas?.pedidosIfood}
                            </span>
                        </div>
                        <span className="mt-2 text-sm font-medium">iFood</span>
                        {(metricas?.totalPedidosEntregues ?? 0) >
                            0 && (
                            <span className="text-xs text-base-content/50">
                                {((metricas?.pedidosIfood ?? 0) /
                                    (metricas
                                        ?.totalPedidosEntregues ?? 0)) *
                                    100}
                                %
                            </span>
                        )}
                    </div>
                    <div className="text-4xl text-base-content/20">vs</div>
                    <div className="flex flex-col items-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-2xl font-bold text-primary">
                                {metricas?.pedidosDireto}
                            </span>
                        </div>
                        <span className="mt-2 text-sm font-medium">Direto</span>
                        {(metricas?.totalPedidosEntregues ?? 0) >
                            0 && (
                            <span className="text-xs text-base-content/50">
                                {((metricas?.pedidosDireto ?? 0) /
                                    (metricas
                                        ?.totalPedidosEntregues ?? 0)) *
                                    100}
                                %
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
