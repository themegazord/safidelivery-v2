import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import {
    AlertCircleIcon,
    CheckCircle,
    Clock,
    ConciergeBell,
    DollarSign,
    Motorbike,
    Flame,
    Truck,
    Calendar,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { H1, H2 } from "@/components/utils/Heading";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import axios from "axios";
import { Label } from "@/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Stats from "@/components/utils/Stats";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DadosDesempenho, INecessidade } from "@/types/desempenho";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts";
import NecessidadeConfiguracaoSection from "@/components/Empresa/Desempenho/NecessidadeConfiguracaoSection";
import HeaderDesempenho from "@/components/Empresa/Desempenho/HeaderDesempenho";
import VisaoGeralHojeSection from "@/components/Empresa/Desempenho/VisaoGeralHojeSection";

interface IProps {
    necessidadesConfiguracao: INecessidade[];
    temTokenIfood: boolean;
    estaRecebendoIfood: boolean;
    linkDelivery: string;
    linkMesa: string;
}

export default function Desempenho({
    necessidadesConfiguracao,
    temTokenIfood,
    estaRecebendoIfood: estaRecebendoIfoodInicial,
    linkDelivery,
    linkMesa,
}: IProps) {
    const { cnpj } = usePage().props;
    const diaPadrao = 7;
    const [estaRecebendoIfood, setEstaRecebendoIfood] = useState(
        estaRecebendoIfoodInicial
    );
    const [dataInicioFiltro, setDataInicioFiltro] = useState(diaPadrao);
    const [dadosBackend, setDadosBackend] = useState<DadosDesempenho | null>(
        null,
    );

    useEffect(() => {
        axios
            .post(
                route("aplicacao.empresa.desempenho.buscaPedidosPorData", {
                    cnpj,
                }),
                {
                    dias: dataInicioFiltro,
                },
            )
            .then(({ data }) => {
                setDadosBackend(data);
                console.log(data);
            })
            .catch(console.error);
    }, [dataInicioFiltro]);

    function configuraRecebimentoIfood(novoValor: boolean) {
        setEstaRecebendoIfood(novoValor);
        router.patch(route("aplicacao.empresa.configuracoes", { cnpj }), {
            esta_recebendo_pedidos_ifood: novoValor,
        });
    }

    function copiar(link: string) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link);
            return;
        }
        const textarea = document.createElement("textarea");
        textarea.value = link;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    }

    function intervaloData(): string {
        const hoje = new Date();
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - dataInicioFiltro);

        const formatar = (d: Date) =>
            d.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });

        return `${formatar(inicio)} a ${formatar(hoje)}`;
    }

    return (
        <LayoutAutenticado>
            <div className="container w-full">
                <NecessidadeConfiguracaoSection necessidades={necessidadesConfiguracao} />

                <HeaderDesempenho 
                    temTokenIfood={temTokenIfood}
                    checkedValue={estaRecebendoIfood}
                    setCheckedValue={configuraRecebimentoIfood}
                    fnCopiar={copiar}
                    linkDelivery={linkDelivery}
                    linkMesa={linkMesa}
                />

                <VisaoGeralHojeSection 
                    financeiroPedidosHoje={dadosBackend?.financeiro_pedidos_hoje ?? []}
                    pedidosHoje={dadosBackend?.pedidos_hoje ?? []}
                />

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
                                R${" "}
                                {dadosBackend?.metricas?.faturamentoPeriodo.toFixed(
                                    2,
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dadosBackend?.metricas?.crescimentoFaturamento !=
                                0 && (
                                <div
                                    className={`${(dadosBackend?.metricas?.crescimentoFaturamento ?? 0) > 0 ? "text-green-500" : "text-red-500"} mt-1 flex items-center gap-1 text-sm`}
                                >
                                    <div className="flex gap-2 items-center">
                                        {(dadosBackend?.metricas
                                            ?.crescimentoFaturamento ?? 0) >
                                        0 ? (
                                            <TrendingUp />
                                        ) : (
                                            <TrendingDown />
                                        )}
                                        {Math.abs(
                                            dadosBackend?.metricas
                                                ?.crescimentoFaturamento ?? 0,
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
                                {dadosBackend?.metricas?.totalPedidosEntregues}{" "}
                                pedidos
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Ticket médio:</CardTitle>
                            <CardDescription className="font-bold text-xl">
                                R${" "}
                                {dadosBackend?.metricas?.ticketMedio.toFixed(2)}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Cancelamentos:</CardTitle>
                            <CardDescription
                                className={`${(dadosBackend?.metricas?.totalPedidosEntregues ?? 0 > 10) ? "text-red-500" : ""} font-bold text-xl`}
                            >
                                {dadosBackend?.metricas?.totalPedidosCancelados}{" "}
                                pedidos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dadosBackend?.metricas?.taxaCancelamento}% do total
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Via IFOOD:</CardTitle>
                            <CardDescription className="font-bold text-xl">
                                {dadosBackend?.metricas?.pedidosIfood} pedidos
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Pedido direto:</CardTitle>
                            <CardDescription className="font-bold text-xl">
                                {dadosBackend?.metricas?.pedidosDireto} pedidos
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card className="col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Faturamento diário</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(dadosBackend?.charts?.faturamentoDiario?.data
                                .length ?? 0) > 0 ? (
                                <ChartContainer
                                    config={
                                        dadosBackend?.charts?.faturamentoDiario
                                            ?.config ?? {}
                                    }
                                    className="aspect-auto h-62.5 w-full"
                                >
                                    <AreaChart
                                        data={
                                            dadosBackend?.charts
                                                ?.faturamentoDiario?.data
                                        }
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
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                        />
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Horários de Pico</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(dadosBackend?.charts?.horariosPico?.data.length ??
                                0) > 0 ? (
                                <ChartContainer
                                    config={
                                        dadosBackend?.charts?.horariosPico
                                            ?.config ?? {
                                            pedidos: {
                                                label: "Pedidos",
                                                color: "#6366f1",
                                            },
                                        }
                                    }
                                    className="h-64 w-full"
                                >
                                    <BarChart
                                        data={
                                            dadosBackend?.charts?.horariosPico
                                                ?.data ?? []
                                        }
                                    >
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
                                            content={
                                                <ChartTooltipContent
                                                    hideLabel
                                                />
                                            }
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Formas de Pagamento</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 pb-0">
                            {(dadosBackend?.charts?.formasPagamento?.data
                                .length ?? 0 > 0) ? (
                                <ChartContainer
                                    config={
                                        dadosBackend?.charts?.formasPagamento
                                            ?.config ?? {}
                                    }
                                    className="mx-auto aspect-square max-h-75"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    hideLabel
                                                />
                                            }
                                        />
                                        <Pie
                                            data={
                                                dadosBackend?.charts
                                                    ?.formasPagamento?.data ??
                                                []
                                            }
                                            dataKey="quantidade"
                                            nameKey="forma"
                                            innerRadius={60}
                                        />
                                        <ChartLegend
                                            content={
                                                <ChartLegendContent nameKey="forma" />
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Pedidos por modalidade</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 pb-0">
                            {(dadosBackend?.charts?.modalidade?.data.length ??
                            0 > 0) ? (
                                <ChartContainer
                                    config={
                                        dadosBackend?.charts?.modalidade
                                            ?.config ?? {}
                                    }
                                    className="mx-auto aspect-square max-h-75"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    hideLabel
                                                />
                                            }
                                        />
                                        <Pie
                                            data={
                                                dadosBackend?.charts?.modalidade
                                                    ?.data ?? []
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Origem dos pedidos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-48 items-center justify-around">
                                <div className="flex flex-col items-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
                                        <span className="text-2xl font-bold text-orange-500">
                                            {
                                                dadosBackend?.metricas
                                                    ?.pedidosIfood
                                            }
                                        </span>
                                    </div>
                                    <span className="mt-2 text-sm font-medium">
                                        iFood
                                    </span>
                                    {(dadosBackend?.metricas
                                        ?.totalPedidosEntregues ?? 0) > 0 && (
                                        <span className="text-xs text-base-content/50">
                                            {((dadosBackend?.metricas
                                                ?.pedidosIfood ?? 0) /
                                                (dadosBackend?.metricas
                                                    ?.totalPedidosEntregues ??
                                                    0)) *
                                                100}
                                            %
                                        </span>
                                    )}
                                </div>
                                <div className="text-4xl text-base-content/20">
                                    vs
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                        <span className="text-2xl font-bold text-primary">
                                            {
                                                dadosBackend?.metricas
                                                    ?.pedidosDireto
                                            }
                                        </span>
                                    </div>
                                    <span className="mt-2 text-sm font-medium">
                                        Direto
                                    </span>
                                    {(dadosBackend?.metricas
                                        ?.totalPedidosEntregues ?? 0) > 0 && (
                                        <span className="text-xs text-base-content/50">
                                            {((dadosBackend?.metricas
                                                ?.pedidosDireto ?? 0) /
                                                (dadosBackend?.metricas
                                                    ?.totalPedidosEntregues ??
                                                    0)) *
                                                100}
                                            %
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </LayoutAutenticado>
    );
}
