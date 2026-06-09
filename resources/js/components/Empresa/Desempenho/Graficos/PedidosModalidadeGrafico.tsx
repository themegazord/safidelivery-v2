import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ChartsDesempenho } from "@/types/desempenho";
import { Pie, PieChart } from "recharts";

interface IProps {
  charts: ChartsDesempenho | undefined
}

export default function PedidosModalidadeGrafico({charts}: IProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pedidos por modalidade</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                {(charts?.modalidade?.data.length ?? 0 > 0) ? (
                    <ChartContainer
                        config={charts?.modalidade?.config ?? {}}
                        className="mx-auto aspect-square max-h-75"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={
                                    charts?.modalidade?.data ?? []
                                }
                                dataKey="pedidos"
                                nameKey="modalidade"
                                innerRadius={60}
                            />
                            <ChartLegend
                                content={
                                    <ChartLegendContent nameKey="modalidade" />
                                }
                                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                            />
                        </PieChart>
                    </ChartContainer>
                ) : (
                    <div className="flex h-64 items-center justify-center">
                        Sem dados para exibir
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
