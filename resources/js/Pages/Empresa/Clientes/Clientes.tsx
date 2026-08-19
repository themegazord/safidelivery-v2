import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import {
    Banknote,
    CheckCircle, ChevronsUpDown,
    Clock,
    Flame,
    Gift,
    TriangleAlert,
    Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, usePage } from "@inertiajs/react";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import {
    TCashbackConfig,
    TDadosFidelidade,
    TFidelidadeConfig,
    TTopCompradoresPorQuantidade,
    TTopCompradoresPorValor,
} from "@/types/empresa/clientes/types";
import Stats from "@/components/utils/Stats";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {converteReal} from "@/utils/utils";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";

function StatsSkeleton({ quantidade }: { quantidade: number }) {
    return (
        <>
            {Array.from({ length: quantidade }).map((_, idx) => (
                <div
                    key={idx}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

function TopCompradoresSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="flex flex-row items-center gap-3 rounded-xl border-2 border-zinc-200 bg-zinc-50 p-3 sm:flex-col sm:items-start sm:gap-1 dark:border-zinc-800 dark:bg-zinc-900"
                        >
                            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-3 w-14" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function Clientes() {
    const {
        cnpj,
        periodoInatividadeCliente,
        fidelidadeConfig,
        cashbackConfig,
    } = usePage<{
        cnpj: string;
        periodoInatividadeCliente: boolean;
        fidelidadeConfig?: TFidelidadeConfig;
        cashbackConfig?: TCashbackConfig;
    }>().props;

    const [dadosPainelFidelidade, setDadosPainelFidelidades] = useState<
        TDadosFidelidade | undefined
    >(undefined);

    const [topCompradoresPorValor, setTopCompradoresPorValor] =
        useState<TTopCompradoresPorValor[] | undefined>(undefined);
const [topCompradoresPorQuantidade, setTopCompradoresPorQuantidade] =
        useState<TTopCompradoresPorQuantidade[] | undefined>(undefined);

    const [loadingDadosPainelFidelidade, setLoadingDadosPainelFidelidade] = useState(false);
    const [loadingTopCompradoresPorValor, setLoadingTopCompradoresPorValor] = useState(false);
    const [loadingTopCompradoresPorQuantidade, setLoadingTopCompradoresPorQuantidade] = useState(false);

    const [collapsibleTopCompradoresPorValor, setCollapsibleTopCompradoresPorValor] = useState(false);
    const [collapsibleTopCompradoresPorQuantidade, setCollapsibleTopCompradoresPorQuantidade] = useState(false);

    const CASHBACK_CONFIG_DATA = [
        {
            isMoney: true,
            icon: <Banknote />,
            color: "green",
            title: "Cashback emitido",
            value: dadosPainelFidelidade?.cashback_emitido
        },
        {
            isMoney: true,
            icon: <CheckCircle />,
            color: "blue",
            title: "Cashback utilizado",
            value: dadosPainelFidelidade?.cashback_utilizado
        },
        {
            isMoney: true,
            icon: <Wallet />,
            color: "pink",
            title: "Saldo ativo",
            value: dadosPainelFidelidade?.cashback_saldo_ativo
        },
        {
            isMoney: true,
            icon: <Clock />,
            color: "orange",
            title: "A vencer em 30d",
            value: dadosPainelFidelidade?.cashback_a_vencer_30d
        },
    ] as const;

    const FIDELIDADE_CONFIG_DATA = [
        {
            isMoney: false,
            icon: <Gift />,
            color: "purple",
            title: "Recompensas disponíveis",
            value: dadosPainelFidelidade?.clientes_com_recompensa
        },
        {
            isMoney: false,
            icon: <Flame />,
            color: "red",
            title: "Próximos da meta (≥70%)",
            value: dadosPainelFidelidade?.clientes_proximos_meta
        },
    ] as const;

    const MEDALHAS = [
        {emoji: '🥇', classe: 'border-yellow-400 bg-yellow-50'},
        {emoji: '🥈', classe: 'border-gray-400 bg-gray-50'},
        {emoji: '🥉', classe: 'border-orange-400 bg-orange-50'},
    ] as const;

    async function carregaDadosPainelFidelidade() {
        setLoadingDadosPainelFidelidade(true);
        await axios
            .get(
                route(
                    "aplicacao.empresa.clientes.consultaDadosPainelCashback",
                    { cnpj },
                ),
            )
            .then((response) => {
                setDadosPainelFidelidades(response.data.dados);
            })
            .catch((error) => {
                toast.error(error.response.data.message);
            })
            .finally(() => setLoadingDadosPainelFidelidade(false));
    }

    async function carregaTopCompradoresPorValor() {
        setLoadingTopCompradoresPorValor(true);
        await axios
            .get(
                route("aplicacao.empresa.clientes.topCompradoresPorValor", {
                    cnpj,
                }),
            )
            .then((response) => {
                setTopCompradoresPorValor(response.data.dados);
            })
            .catch((error) => {
                toast.error(error.response.data.message);
            })
            .finally(() => setLoadingTopCompradoresPorValor(false));
    }

    async function carregaTopCompradoresPorQuantidade() {
        setLoadingTopCompradoresPorQuantidade(true);
        await axios
            .get(
                route("aplicacao.empresa.clientes.topCompradoresPorQuantidade", {
                    cnpj,
                }),
            )
            .then((response) => {
                setTopCompradoresPorQuantidade(response.data.dados);
            })
            .catch((error) => {
                toast.error(error.response.data.message);
            })
            .finally(() => setLoadingTopCompradoresPorQuantidade(false));
    }

    useEffect(() => {
        carregaDadosPainelFidelidade()
        carregaTopCompradoresPorValor()
        carregaTopCompradoresPorQuantidade()
    }, [])

    return (
        <LayoutAutenticado>
            <Card>
                <CardHeader>
                    <CardTitle>Clientes</CardTitle>
                    <CardDescription>
                        Veja todos os clientes que já compraram na sua empresa
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!periodoInatividadeCliente && (
                        <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                            <TriangleAlert />
                            <AlertTitle>Configuração pendente!</AlertTitle>
                            <AlertDescription>
                                A configuração de dias para inatividade está
                                pendente ou é zero, para melhor gestão configure
                                um número de dias.
                            </AlertDescription>
                            <AlertAction>
                                <Button
                                    variant="outline"
                                    render={
                                        <Link
                                            href={route(
                                                "aplicacao.empresa.configempresa.configuracoes",
                                                { cnpj: cnpj },
                                            )}
                                        />
                                    }
                                >
                                    Ir para configuração
                                </Button>
                            </AlertAction>
                        </Alert>
                    )}
                    {(fidelidadeConfig || cashbackConfig) && (
                        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                            {loadingDadosPainelFidelidade ? (
                                <StatsSkeleton
                                    quantidade={
                                        (cashbackConfig
                                            ? CASHBACK_CONFIG_DATA.length
                                            : 0) +
                                        (fidelidadeConfig
                                            ? FIDELIDADE_CONFIG_DATA.length
                                            : 0)
                                    }
                                />
                            ) : (
                                <>
                                    {cashbackConfig && (
                                        <>
                                            {CASHBACK_CONFIG_DATA.map(
                                                (ccd, ccdIdx) => (
                                                    <Stats
                                                        key={ccdIdx}
                                                        title={ccd.title}
                                                        value={ccd.value}
                                                        color={ccd.color}
                                                        isMoney={ccd.isMoney}
                                                        icon={ccd.icon}
                                                    />
                                                ),
                                            )}
                                        </>
                                    )}

                                    {fidelidadeConfig && (
                                        <>
                                            {FIDELIDADE_CONFIG_DATA.map(
                                                (fcd, fcdIdx) => (
                                                    <Stats
                                                        key={fcdIdx}
                                                        title={fcd.title}
                                                        value={fcd.value}
                                                        color={fcd.color}
                                                        isMoney={fcd.isMoney}
                                                        icon={fcd.icon}
                                                    />
                                                ),
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
                        {loadingTopCompradoresPorValor && (
                            <TopCompradoresSkeleton />
                        )}
                        {!loadingTopCompradoresPorValor && (topCompradoresPorValor?.length ?? 0) > 0 && (
                            <Collapsible
                                open={collapsibleTopCompradoresPorValor}
                                onOpenChange={
                                    setCollapsibleTopCompradoresPorValor
                                }
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Top por Valor Gasto
                                        </CardTitle>
                                        <CardDescription>
                                            Maiores compradores por valor total
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            {(topCompradoresPorValor ?? [])
                                                .slice(0, 3)
                                                .map(
                                                    (
                                                        comprador,
                                                        compradorIdx,
                                                    ) => (
                                                        <div
                                                            className={`${MEDALHAS[compradorIdx].classe} flex flex-row items-center gap-3 rounded-xl border-2 p-3 sm:flex-col sm:items-start sm:gap-1`}
                                                        >
                                                            <span className="shrink-0 text-2xl sm:text-xl">
                                                                {
                                                                    MEDALHAS[
                                                                        compradorIdx
                                                                    ].emoji
                                                                }
                                                            </span>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="truncate text-sm font-bold">
                                                                    {
                                                                        comprador.nome
                                                                    }
                                                                </div>
                                                                <div className="mt-0.5 text-xs text-gray-400">
                                                                    Total gasto
                                                                </div>
                                                                <div className="text-sm font-semibold text-green-700">
                                                                    R${" "}
                                                                    {converteReal(
                                                                        comprador.valor_total_gasto,
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {
                                                                        comprador.total_pedidos
                                                                    }{" "}
                                                                    pedidos
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                        </div>
                                        {(topCompradoresPorValor ?? []).length >
                                            3 && (
                                            <>
                                                <CollapsibleTrigger
                                                    render={
                                                        <Button
                                                            variant={"ghost"}
                                                        >
                                                            <ChevronsUpDown />{" "}
                                                            {collapsibleTopCompradoresPorValor
                                                                ? "Ocultar restante"
                                                                : `Ver posições 4º-${topCompradoresPorValor?.length}º`}
                                                        </Button>
                                                    }
                                                />
                                                <CollapsibleContent className="flex flex-col divide-y">
                                                    {(
                                                        topCompradoresPorValor ??
                                                        []
                                                    )
                                                        .slice(3)
                                                        .map(
                                                            (
                                                                comprador,
                                                                compradorIdx,
                                                            ) => (
                                                                <div className="flex items-center justify-between gap-2 py-2">
                                                                    <div className="flex min-w-0 items-center gap-2">
                                                                        <span className="w-4 shrink-0 text-right text-xs font-bold text-gray-400">
                                                                            {compradorIdx +
                                                                                4}
                                                                            º
                                                                        </span>
                                                                        <span className="truncate text-sm font-medium">
                                                                            {
                                                                                comprador.nome
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex shrink-0 items-center gap-2 text-sm">
                                                                        <span className="font-semibold whitespace-nowrap text-green-700">
                                                                            R${" "}
                                                                            {converteReal(
                                                                                comprador.valor_total_gasto,
                                                                            )}
                                                                        </span>
                                                                        <span className="text-xs whitespace-nowrap text-gray-400">
                                                                            {
                                                                                comprador.total_pedidos
                                                                            }{" "}
                                                                            ped.
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                </CollapsibleContent>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Collapsible>
                        )}
                        {loadingTopCompradoresPorQuantidade && (
                            <TopCompradoresSkeleton />
                        )}
                        {!loadingTopCompradoresPorQuantidade && (topCompradoresPorQuantidade?.length ?? 0) > 0 && (
                            <Collapsible
                                open={collapsibleTopCompradoresPorQuantidade}
                                onOpenChange={
                                    setCollapsibleTopCompradoresPorQuantidade
                                }
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Top por Quantidade Gasto
                                        </CardTitle>
                                        <CardDescription>
                                            Maiores compradores por valor total
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            {(topCompradoresPorQuantidade ?? [])
                                                .slice(0, 3)
                                                .map(
                                                    (
                                                        comprador,
                                                        compradorIdx,
                                                    ) => (
                                                        <div
                                                            className={`${MEDALHAS[compradorIdx].classe} flex flex-row items-center gap-3 rounded-xl border-2 p-3 sm:flex-col sm:items-start sm:gap-1`}
                                                        >
                                                            <span className="shrink-0 text-2xl sm:text-xl">
                                                                {
                                                                    MEDALHAS[
                                                                        compradorIdx
                                                                    ].emoji
                                                                }
                                                            </span>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="truncate text-sm font-bold">
                                                                    {
                                                                        comprador.nome
                                                                    }
                                                                </div>
                                                                <div className="mt-0.5 text-xs text-gray-400">
                                                                    Total gasto
                                                                </div>
                                                                <div className="text-sm font-semibold text-green-700">
                                                                    R${" "}
                                                                    {converteReal(
                                                                        comprador.valor_total_gasto,
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {
                                                                        comprador.total_pedidos
                                                                    }{" "}
                                                                    pedidos
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                        </div>
                                        {(topCompradoresPorQuantidade ?? []).length >
                                            3 && (
                                            <>
                                                <CollapsibleTrigger
                                                    render={
                                                        <Button
                                                            variant={"ghost"}
                                                        >
                                                            <ChevronsUpDown />{" "}
                                                            {collapsibleTopCompradoresPorQuantidade
                                                                ? "Ocultar restante"
                                                                : `Ver posições 4º-${topCompradoresPorQuantidade?.length}º`}
                                                        </Button>
                                                    }
                                                />
                                                <CollapsibleContent className="flex flex-col divide-y">
                                                    {(
                                                        topCompradoresPorQuantidade ??
                                                        []
                                                    )
                                                        .slice(3)
                                                        .map(
                                                            (
                                                                comprador,
                                                                compradorIdx,
                                                            ) => (
                                                                <div className="flex items-center justify-between gap-2 py-2">
                                                                    <div className="flex min-w-0 items-center gap-2">
                                                                        <span className="w-4 shrink-0 text-right text-xs font-bold text-gray-400">
                                                                            {compradorIdx +
                                                                                4}
                                                                            º
                                                                        </span>
                                                                        <span className="truncate text-sm font-medium">
                                                                            {
                                                                                comprador.nome
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex shrink-0 items-center gap-2 text-sm">
                                                                        <span className="font-semibold whitespace-nowrap text-green-700">
                                                                            R${" "}
                                                                            {converteReal(
                                                                                comprador.valor_total_gasto,
                                                                            )}
                                                                        </span>
                                                                        <span className="text-xs whitespace-nowrap text-gray-400">
                                                                            {
                                                                                comprador.total_pedidos
                                                                            }{" "}
                                                                            ped.
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                </CollapsibleContent>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Collapsible>
                        )}
                    </div>
                </CardContent>
            </Card>
        </LayoutAutenticado>
    );
}
