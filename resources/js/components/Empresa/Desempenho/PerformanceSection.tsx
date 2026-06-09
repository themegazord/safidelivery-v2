import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MetricasDesempenho } from "@/types/desempenho";
import { Calendar, TrendingDown, TrendingUp } from "lucide-react";

interface IProps {
    intervaloData: () => string;
    setDataInicioFiltro: (dia: number) => void;
    metricas: MetricasDesempenho | undefined;
}

export default function PerformanceSection({
    intervaloData,
    setDataInicioFiltro,
    metricas,
}: IProps) {
    return (
        <section className="flex flex-col gap-4">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-lg bg-primary-200 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                    <Calendar />
                    <span className="font-medium">{intervaloData()}</span>
                </div>
                <ToggleGroup type="single">
                    {[7, 15, 30].map((dia) => (
                        <ToggleGroupItem
                            onClick={() => setDataInicioFiltro(dia)}
                            key={dia}
                            value={String(dia)}
                        >
                            {dia} dias
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Faturamento</CardTitle>
                        <CardDescription className="font-bold text-xl">
                            R$ {metricas?.faturamentoPeriodo.toFixed(2)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {metricas?.crescimentoFaturamento != 0 && (
                            <div
                                className={`${(metricas?.crescimentoFaturamento ?? 0) > 0 ? "text-green-500" : "text-red-500"} mt-1 flex items-center gap-1 text-sm`}
                            >
                                <div className="flex gap-2 items-center">
                                    {(metricas?.crescimentoFaturamento ?? 0) >
                                    0 ? (
                                        <TrendingUp />
                                    ) : (
                                        <TrendingDown />
                                    )}
                                    {Math.abs(
                                        metricas?.crescimentoFaturamento ?? 0,
                                    ).toFixed(2)}{" "}
                                    %
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pedidos entregues:</CardTitle>
                        <CardDescription className="font-bold text-xl">
                            {metricas?.totalPedidosEntregues} pedidos
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Ticket médio:</CardTitle>
                        <CardDescription className="font-bold text-xl">
                            R$ {metricas?.ticketMedio.toFixed(2)}
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Cancelamentos:</CardTitle>
                        <CardDescription
                            className={`${(metricas?.totalPedidosEntregues ?? 0 > 10) ? "text-red-500" : ""} font-bold text-xl`}
                        >
                            {metricas?.totalPedidosCancelados} pedidos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {metricas?.taxaCancelamento}% do total
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Via IFOOD:</CardTitle>
                        <CardDescription className="font-bold text-xl">
                            {metricas?.pedidosIfood} pedidos
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pedido direto:</CardTitle>
                        <CardDescription className="font-bold text-xl">
                            {metricas?.pedidosDireto} pedidos
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </section>
    );
}
