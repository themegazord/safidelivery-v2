import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import { AlertCircleIcon, CheckCircle, Clock, ConciergeBell, DollarSign, Motorbike, Flame, Truck, Calendar } from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { H1, H2 } from "@/components/utils/Heading";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Stats from "@/components/utils/Stats";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface IProps {
    necessidadesConfiguracao: INecessidade[],
    temTokenIfood: boolean,
    estaRecebendoIfood: boolean,
    linkDelivery: string,
    linkMesa: string
}

interface INecessidade {
    titulo: string,
    mensagem: string,
    link: ILink
}

interface ILink {
    nomeRota: string,
    paramRota: string
}

export default function Desempenho({
    necessidadesConfiguracao,
    temTokenIfood,
    estaRecebendoIfood: estaRecebendoIfoodInicial,
    linkDelivery,
    linkMesa
}: IProps) {
    const { cnpj } = usePage().props
    const [estaRecebendoIfood, setEstaRecebendoIfood] = useState(estaRecebendoIfoodInicial)
    const [dataInicioFiltro, setDataInicioFiltro] = useState(7)

    useEffect(() => {
        const datasArray = intervaloData().split(' a ')
        axios.post(route('aplicacao.empresa.desempenho.buscaPedidosPorData', { cnpj }), {
            data_inicio: datasArray[0],
            data_fim: datasArray[1],
        }).then(({ data }) => {
            console.log(data)
        }).catch(console.error)
    }, [dataInicioFiltro])

    function configuraRecebimentoIfood(novoValor: boolean) {
        setEstaRecebendoIfood(novoValor)
        router.patch(route('aplicacao.empresa.configuracoes', { cnpj }), {
            esta_recebendo_pedidos_ifood: novoValor,
        })
    }

    function copiar(link: string) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link)
            return
        }
        const textarea = document.createElement('textarea')
        textarea.value = link
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
    }

    function intervaloData(): string {
        const hoje = new Date()
        const inicio = new Date()
        inicio.setDate(inicio.getDate() - dataInicioFiltro)

        const formatar = (d: Date) =>
            d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

        return `${formatar(inicio)} a ${formatar(hoje)}`
    }

    return (
        <LayoutAutenticado>
            <div className="container w-full">
                {necessidadesConfiguracao.length >= 1 && (
                    <div className="container w-full flex flex-col gap-4">
                        {necessidadesConfiguracao.map((necessidade, idx) => (
                            <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50" key={idx}>
                                <AlertTitle className="flex gap-4"><AlertCircleIcon />{necessidade.titulo}</AlertTitle>
                                <AlertDescription>{necessidade.mensagem}</AlertDescription>
                                <AlertAction>
                                    <Button variant={"outline"} asChild>
                                        <Link href={route(necessidade.link.nomeRota, necessidade.link.paramRota)}>
                                            Configurar
                                        </Link>
                                    </Button>
                                </AlertAction>
                            </Alert>
                        ))}
                    </div>
                )}

                <div className="my-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <H1 className="font-bold">Painel de desempenho</H1>
                        <p className="text-base-content/70">Visão geral do seu negócio</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        {temTokenIfood && (
                            <div className="flex gap-2">
                                <Switch checked={estaRecebendoIfood} onCheckedChange={(valor) => configuraRecebimentoIfood(valor)} id="esta-recebendo-ifood" />
                                <Label htmlFor="esta-recebendo-ifood">Está recebendo pedidos do IFood?</Label>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => copiar(linkDelivery)}>
                                        <Motorbike />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Link para Delivery
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => copiar(linkMesa)}>
                                        <ConciergeBell />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Link para atendimento em mesa
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                    <H2 className="flex gap-2 items-center">
                        <>
                            <Clock />
                            Hoje
                        </>
                    </H2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <Stats
                            title="Faturamento"
                            value={100}
                            icon={<DollarSign />}
                            color="green"
                            isMoney
                        />
                        <Stats
                            title="Pedidos entregues"
                            value={10}
                            icon={<CheckCircle />}
                            color="blue"
                        />
                        <Stats
                            title="Em produção"
                            value={4}
                            icon={<Flame />}
                            color="red"
                        />
                        <Stats
                            title="Em entrega"
                            value={5}
                            icon={<Truck />}
                            color="purple"
                        />
                    </div>
                </div>

                <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-lg bg-primary-200 p-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <Calendar />
                        <span className="font-medium">{intervaloData()}</span>
                    </div>
                    <ToggleGroup type="single">
                        {[7, 15, 30].map((dia) => (
                            <ToggleGroupItem onClick={() => setDataInicioFiltro(dia)} key={dia} value={String(dia)}>{dia} dias</ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
            </div>
        </LayoutAutenticado>
    )
}
