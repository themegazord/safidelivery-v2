import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ChartsDesempenho } from "@/types/desempenho";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface IProps {
  charts: ChartsDesempenho | undefined
}

export default function FaturamentoDiarioGrafico({charts}: IProps) {
    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Faturamento diário</CardTitle>
            </CardHeader>
            <CardContent>
                {(charts?.faturamentoDiario?.data.length ?? 0) >
                0 ? (
                    <ChartContainer
                        config={
                            charts?.faturamentoDiario?.config ??
                            {}
                        }
                        className="aspect-auto h-62.5 w-full"
                    >
                        <AreaChart
                            data={charts?.faturamentoDiario?.data}
                        >
                            <defs>
                                <linearGradient
                                    id="gradFaturamento"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-faturamento)"
                                        stopOpacity={0.4}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-faturamento)"
                                        stopOpacity={0.05}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                                type="monotone"
                                dataKey="faturamento"
                                stroke="var(--color-faturamento)"
                                strokeWidth={2}
                                fill="url(#gradFaturamento)"
                                dot={false}
                            />
                        </AreaChart>
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
