import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartsDesempenho } from "@/types/desempenho";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface IProps {
    charts: ChartsDesempenho | undefined;
}

export default function HorarioPicoGrafico({ charts }: IProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Horários de Pico</CardTitle>
            </CardHeader>
            <CardContent>
                {(charts?.horariosPico?.data.length ?? 0) > 0 ? (
                    <ChartContainer
                        config={
                            charts?.horariosPico?.config ?? {
                                pedidos: {
                                    label: "Pedidos",
                                    color: "#6366f1",
                                },
                            }
                        }
                        className="h-64 w-full"
                    >
                        <BarChart data={charts?.horariosPico?.data ?? []}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="hora"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis hide />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar
                                dataKey="pedidos"
                                fill="var(--color-pedidos)"
                                radius={8}
                            />
                        </BarChart>
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
