import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricasDesempenho } from "@/types/desempenho";

interface IProps {
    metricas: MetricasDesempenho | undefined;
}

export default function OrigemPedidosGrafico({ metricas }: IProps) {
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
                        {(metricas?.totalPedidosEntregues ?? 0) > 0 && (
                            <span className="text-base-content/50 text-xs">
                                {((metricas?.pedidosIfood ?? 0) /
                                    (metricas?.totalPedidosEntregues ?? 0)) *
                                    100}
                                %
                            </span>
                        )}
                    </div>
                    <div className="text-base-content/20 text-4xl">vs</div>
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full">
                            <span className="text-primary text-2xl font-bold">
                                {metricas?.pedidosDireto}
                            </span>
                        </div>
                        <span className="mt-2 text-sm font-medium">Direto</span>
                        {(metricas?.totalPedidosEntregues ?? 0) > 0 && (
                            <span className="text-base-content/50 text-xs">
                                {((metricas?.pedidosDireto ?? 0) /
                                    (metricas?.totalPedidosEntregues ?? 0)) *
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
