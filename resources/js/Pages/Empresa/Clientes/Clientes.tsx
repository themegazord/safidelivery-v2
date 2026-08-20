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
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Banknote,
    CheckCircle,
    ChevronsUpDown,
    Clock,
    Eye,
    Flame,
    Gift,
    RotateCcw,
    TriangleAlert,
    Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, router, usePage } from "@inertiajs/react";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import {
    TCashbackConfig,
    TClienteDetalhe,
    TClienteListagem,
    TDadosFidelidade,
    TFidelidadeConfig,
    TFiltrosClientes,
    TTopCompradoresPorQuantidade,
    TTopCompradoresPorValor,
} from "@/types/empresa/clientes/types";
import { IPaginacao } from "@/types/empresa/cardapios/types";
import Stats from "@/components/utils/Stats";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { converteReal } from "@/utils/utils";
import { formatarData, formatarTelefone } from "@/utils/pedidos";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ClienteDetalhesDialog from "@/components/Empresa/Clientes/ClienteDetalhesDialog";

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

interface IProps {
    clientes: IPaginacao<TClienteListagem>;
    filtros: TFiltrosClientes;
    timezone: string;
}

export default function Clientes({ clientes, filtros, timezone }: IProps) {
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

    const [nome, setNome] = useState(filtros.nome ?? "");
    const [telefone, setTelefone] = useState(filtros.telefone ?? "");
    const primeiraRenderizacao = useRef(true);

    const [clienteDetalhe, setClienteDetalhe] = useState<TClienteDetalhe | undefined>(undefined);
    const [loadingDetalhe, setLoadingDetalhe] = useState(false);
    const [modalDetalheOpen, setModalDetalheOpen] = useState(false);

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

    function aplicarFiltros(novosFiltros: Partial<TFiltrosClientes>) {
        router.get(
            route("aplicacao.empresa.clientes.index", { cnpj }),
            { ...filtros, ...novosFiltros },
            { preserveState: true, replace: true },
        );
    }

    useEffect(() => {
        if (primeiraRenderizacao.current) {
            primeiraRenderizacao.current = false;
            return;
        }
        const temporizador = setTimeout(() => aplicarFiltros({ nome, telefone }), 400);
        return () => clearTimeout(temporizador);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nome, telefone]);

    function limparFiltros() {
        setNome("");
        setTelefone("");
        router.get(route("aplicacao.empresa.clientes.index", { cnpj }), {}, { preserveState: true, replace: true });
    }

    function ordenarPor(coluna: string) {
        const novaDirecao = filtros.sort_by === coluna && filtros.sort_dir !== "desc" ? "desc" : "asc";
        aplicarFiltros({ sort_by: coluna, sort_dir: novaDirecao });
    }

    function iconeOrdenacao(coluna: string) {
        if (filtros.sort_by !== coluna) return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />;
        return filtros.sort_dir === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />;
    }

    async function abrirDetalhes(clienteId: number) {
        setModalDetalheOpen(true);
        setLoadingDetalhe(true);
        await axios
            .get(route("aplicacao.empresa.clientes.detalhe", { cnpj, cliente_id: clienteId }))
            .then((response) => setClienteDetalhe(response.data))
            .catch((error) => toast.error(error.response?.data?.message ?? "Erro ao carregar o cliente"))
            .finally(() => setLoadingDetalhe(false));
    }

    function renderProgressoFidelidade(cliente: TClienteListagem) {
        if (!fidelidadeConfig) return null;

        if (cliente.recompensa_disponivel) {
            return (
                <Badge className="bg-emerald-600 text-white">
                    <Gift className="h-3 w-3" /> Recompensa disponível!
                </Badge>
            );
        }

        const meta = fidelidadeConfig.valor_gatilho;
        if (!(meta > 0)) return <span className="text-xs text-muted-foreground">—</span>;

        const atual = fidelidadeConfig.tipo_gatilho === "qtd_pedidos" ? cliente.pontos_fidelidade : cliente.valor_acumulado_fidelidade;
        const label = fidelidadeConfig.tipo_gatilho === "qtd_pedidos"
            ? `${atual}/${meta} pedidos`
            : `R$ ${converteReal(atual)} / R$ ${converteReal(meta)}`;
        const percentual = Math.min(100, Math.round((atual / meta) * 100));

        return (
            <div className="flex w-36 flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                    <span className={percentual >= 70 ? "font-semibold text-orange-600" : "text-muted-foreground"}>{label}</span>
                    {percentual >= 70 && <Flame className="h-3 w-3 text-orange-500" />}
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className={`h-full rounded-full ${percentual >= 70 ? "bg-orange-500" : "bg-primary"}`}
                        style={{ width: `${percentual}%` }}
                    />
                </div>
                <span className="text-right text-xs text-muted-foreground">{percentual}%</span>
            </div>
        );
    }

    const colspan = 7 + (fidelidadeConfig ? 1 : 0) + (cashbackConfig ? 1 : 0) + (periodoInatividadeCliente ? 1 : 0) + 1;
    const temFiltrosAtivos = Boolean(
        filtros.nome || filtros.telefone || filtros.primeira_compra_inicio || filtros.primeira_compra_fim ||
        filtros.ultima_compra_inicio || filtros.ultima_compra_fim || filtros.proximo_meta,
    );

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
                                                            key={comprador.id}
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
                                                                <div key={comprador.id} className="flex items-center justify-between gap-2 py-2">
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
                                                            key={comprador.id}
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
                                                                <div key={comprador.id} className="flex items-center justify-between gap-2 py-2">
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

                    <Card className="mt-4">
                        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="filtro-nome">Nome do cliente</Label>
                                <Input id="filtro-nome" placeholder="Insira o nome do cliente..." value={nome} onChange={(e) => setNome(e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="filtro-telefone">Telefone do cliente</Label>
                                <Input id="filtro-telefone" placeholder="Insira o telefone do cliente..." value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="filtro-primeira-compra-inicio">Primeira compra (de)</Label>
                                <Input
                                    id="filtro-primeira-compra-inicio"
                                    type="date"
                                    value={filtros.primeira_compra_inicio ?? ""}
                                    onChange={(e) => aplicarFiltros({ primeira_compra_inicio: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="filtro-primeira-compra-fim">Primeira compra (até)</Label>
                                <Input
                                    id="filtro-primeira-compra-fim"
                                    type="date"
                                    value={filtros.primeira_compra_fim ?? ""}
                                    onChange={(e) => aplicarFiltros({ primeira_compra_fim: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="filtro-ultima-compra-inicio">Última compra (de)</Label>
                                <Input
                                    id="filtro-ultima-compra-inicio"
                                    type="date"
                                    value={filtros.ultima_compra_inicio ?? ""}
                                    onChange={(e) => aplicarFiltros({ ultima_compra_inicio: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="filtro-ultima-compra-fim">Última compra (até)</Label>
                                <Input
                                    id="filtro-ultima-compra-fim"
                                    type="date"
                                    value={filtros.ultima_compra_fim ?? ""}
                                    onChange={(e) => aplicarFiltros({ ultima_compra_fim: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardContent className="flex flex-wrap items-center gap-4 border-t pt-4">
                            {fidelidadeConfig && (
                                <div className="flex items-center gap-3">
                                    <Switch
                                        id="proximo-meta"
                                        checked={filtros.proximo_meta ?? false}
                                        onCheckedChange={(v) => aplicarFiltros({ proximo_meta: v })}
                                    />
                                    <label htmlFor="proximo-meta" className="text-sm">Apenas próximos da meta (≥ 70%)</label>
                                    {filtros.proximo_meta && dadosPainelFidelidade && (
                                        <Badge className="bg-orange-500 text-white">
                                            <Flame className="h-3 w-3" /> {dadosPainelFidelidade.clientes_proximos_meta} cliente(s)
                                        </Badge>
                                    )}
                                </div>
                            )}
                            {temFiltrosAtivos && (
                                <Button variant="ghost" size="sm" onClick={limparFiltros}>
                                    <RotateCcw /> Limpar filtros
                                </Button>
                            )}
                            <div className="ml-auto text-sm text-muted-foreground">{clientes.total} cliente(s) encontrado(s)</div>
                        </CardContent>
                    </Card>

                    <Card className="mt-4">
                        <CardContent className="overflow-x-auto p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="cursor-pointer select-none" onClick={() => ordenarPor("nome")}>
                                            <span className="flex items-center gap-1">Nome do cliente {iconeOrdenacao("nome")}</span>
                                        </TableHead>
                                        <TableHead>Telefone</TableHead>
                                        <TableHead className="cursor-pointer select-none" onClick={() => ordenarPor("primeira_compra")}>
                                            <span className="flex items-center gap-1">Primeira compra {iconeOrdenacao("primeira_compra")}</span>
                                        </TableHead>
                                        <TableHead className="cursor-pointer select-none" onClick={() => ordenarPor("ultima_compra")}>
                                            <span className="flex items-center gap-1">Última compra {iconeOrdenacao("ultima_compra")}</span>
                                        </TableHead>
                                        <TableHead className="cursor-pointer select-none text-right" onClick={() => ordenarPor("total_pedidos")}>
                                            <span className="flex items-center justify-end gap-1">Qtde. pedidos {iconeOrdenacao("total_pedidos")}</span>
                                        </TableHead>
                                        <TableHead className="cursor-pointer select-none text-right" onClick={() => ordenarPor("valor_total_gasto")}>
                                            <span className="flex items-center justify-end gap-1">Total (R$) {iconeOrdenacao("valor_total_gasto")}</span>
                                        </TableHead>
                                        <TableHead className="cursor-pointer select-none text-right" onClick={() => ordenarPor("ticket_medio")}>
                                            <span className="flex items-center justify-end gap-1">Ticket médio (R$) {iconeOrdenacao("ticket_medio")}</span>
                                        </TableHead>
                                        {fidelidadeConfig && <TableHead>Fidelidade</TableHead>}
                                        {cashbackConfig && <TableHead>Saldo Cashback</TableHead>}
                                        {periodoInatividadeCliente && <TableHead>Status</TableHead>}
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clientes.data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={colspan} className="py-10 text-center text-muted-foreground">
                                                Não contêm clientes ainda.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {clientes.data.map((cliente) => (
                                        <TableRow key={cliente.id} className="cursor-pointer" onClick={() => abrirDetalhes(cliente.id)}>
                                            <TableCell className="font-medium">{cliente.nome}</TableCell>
                                            <TableCell>{formatarTelefone(cliente.telefone)}</TableCell>
                                            <TableCell>{cliente.primeira_compra ? formatarData(cliente.primeira_compra, timezone) : "—"}</TableCell>
                                            <TableCell>{cliente.ultima_compra ? formatarData(cliente.ultima_compra, timezone) : "—"}</TableCell>
                                            <TableCell className="text-right">{cliente.total_pedidos}</TableCell>
                                            <TableCell className="text-right font-semibold text-emerald-600">R$ {converteReal(cliente.valor_total_gasto)}</TableCell>
                                            <TableCell className="text-right">R$ {converteReal(cliente.ticket_medio)}</TableCell>
                                            {fidelidadeConfig && <TableCell>{renderProgressoFidelidade(cliente)}</TableCell>}
                                            {cashbackConfig && (
                                                <TableCell>
                                                    {cliente.saldo_cashback > 0 ? (
                                                        <Badge className="bg-emerald-600 text-white">R$ {converteReal(cliente.saldo_cashback)}</Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                            )}
                                            {periodoInatividadeCliente && (
                                                <TableCell>
                                                    {cliente.esta_ativo ? (
                                                        <Badge className="bg-emerald-600 text-white">Ativo</Badge>
                                                    ) : (
                                                        <Badge variant="destructive">Inativo</Badge>
                                                    )}
                                                </TableCell>
                                            )}
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" onClick={() => abrirDetalhes(cliente.id)}>
                                                    <Eye />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {clientes.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Página {clientes.current_page} de {clientes.last_page} — {clientes.total} clientes
                            </p>
                            <div className="flex gap-2">
                                {clientes.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ClienteDetalhesDialog
                open={modalDetalheOpen}
                onOpenChange={setModalDetalheOpen}
                detalhe={clienteDetalhe}
                loading={loadingDetalhe}
                fidelidadeConfig={fidelidadeConfig}
                cashbackConfig={cashbackConfig}
                timezone={timezone}
            />
        </LayoutAutenticado>
    );
}
