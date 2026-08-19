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
    CheckCircle,
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
} from "@/types/empresa/clientes/types";
import Stats from "@/components/utils/Stats";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

    const [loadingDadosPainelFidelidade, setLoadingDadosPainelFidelidade] = useState(false);

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

    useEffect(() => {
        carregaDadosPainelFidelidade()
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
                                            {CASHBACK_CONFIG_DATA.map((ccd, ccdIdx) => (
                                                <Stats key={ccdIdx} title={ccd.title} value={ccd.value} color={ccd.color} isMoney={ccd.isMoney} icon={ccd.icon} />
                                            ))}
                                        </>
                                    )}

                                    {fidelidadeConfig && (
                                        <>
                                            {FIDELIDADE_CONFIG_DATA.map((fcd, fcdIdx) => (
                                                <Stats key={fcdIdx} title={fcd.title} value={fcd.value} color={fcd.color} isMoney={fcd.isMoney} icon={fcd.icon} />
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </LayoutAutenticado>
    );
}
