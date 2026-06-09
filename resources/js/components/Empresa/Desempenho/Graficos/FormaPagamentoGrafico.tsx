import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ChartsDesempenho } from "@/types/desempenho";
import { Pie, PieChart } from "recharts";

interface IProps {
  charts: ChartsDesempenho | undefined
}

export default function FormaPagamentoGrafico({charts}: IProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Formas de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                {(charts?.formasPagamento?.data.length ??
                0 > 0) ? (
                    <ChartContainer
                        config={
                            charts?.formasPagamento?.config ?? {}
                        }
                        className="mx-auto aspect-square max-h-75"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={
                                    charts?.formasPagamento
                                        ?.data ?? []
                                }
                                dataKey="quantidade"
                                nameKey="forma"
                                innerRadius={60}
                            />
                            <ChartLegend
                                content={<ChartLegendContent nameKey="forma" />}
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
