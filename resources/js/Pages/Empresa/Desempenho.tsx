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
import PerformanceSection from "@/components/Empresa/Desempenho/PerformanceSection";

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

                <PerformanceSection 
                    intervaloData={intervaloData}
                    setDataInicioFiltro={setDataInicioFiltro}
                    metricas={dadosBackend?.metricas}
                />

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
