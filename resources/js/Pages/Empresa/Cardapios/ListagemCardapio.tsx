import DialogClonarCardapio from "@/components/Empresa/Cardapios/DialogClonarCardapio";
import DialogExportarCardapio from "@/components/Empresa/Cardapios/DialogExportarCardapio";
import DialogImportarIfood from "@/components/Empresa/Cardapios/DialogImportarIfood";
import DialogRemoverCardapio from "@/components/Empresa/Cardapios/DialogRemoverCardapio";
import DrawerCUCardapio from "@/components/Empresa/Cardapios/DrawerCUCardapio";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import { ICardapio } from "@/types/cardapio-digital/cardapio";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { ChevronDown, ChevronUp, Cog, Copy, Download, EllipsisVertical, SquarePen, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"
import { SiIfood } from "react-icons/si"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IDropdownData {
    open: boolean,
    onOpenChange: (value: boolean) => void,
    label: string,
    items: TDropdownItemData[]
}

type TDropdownItemData = {
    label: string,
    tag: string,
    action: () => void
}



function DropdownsListagemCardapio({data, existeTokenAnotaai, existeTokensIFOOD}: {data: IDropdownData[], existeTokenAnotaai: boolean, existeTokensIFOOD: boolean}) {
    return (
        <>
            {data.map((d, didx) => (
                <DropdownMenu open={d.open} onOpenChange={d.onOpenChange} key={didx}>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"outline"}>
                            <span className="flex gap-2 items-center">{d.label} {!d.open ? <ChevronDown /> : <ChevronUp />}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {d.items.map((di, diIdx)=> (
                            <DropdownMenuItem key={diIdx} onClick={di.action} disabled={(di.tag === 'anotaai' && !existeTokenAnotaai) || (di.tag === 'ifood' && !existeTokensIFOOD)}>{di.label}</DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            ))}
        </>
    )
}

function CardCardapio({data, cnpj, callEdicao, callClone, callExport, callRemocao}: {
    data: ICardapio,
    cnpj: string,
    callEdicao: (value: number) => void,
    callClone: (value: number) => void,
    callExport: (value: number) => void,
    callRemocao: (value: number) => void,
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    {data.nome}
                    {data.tipo_importacao === 'ifood' ?
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SiIfood className="h-4 w-4 text-red-600" />
                                </TooltipTrigger>
                                <TooltipContent>Cardápio importado do IFOOD</TooltipContent>
                            </Tooltip>
                        </TooltipProvider> :
                        ''}
                </CardTitle>
                <CardDescription>{data.descricao}</CardDescription>
                <CardAction>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={"ghost"}><EllipsisVertical /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => callEdicao(data.id)}>
                                <SquarePen />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => callClone(data.id)}>
                                <Copy />
                                Clonar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => callExport(data.id)}>
                                <Download />
                                Exportar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" variant="destructive" onClick={() => callRemocao(data.id)}>
                                <Trash />
                                Remover
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardAction>
            </CardHeader>
            <CardFooter className="flex flex-row-reverse">
                <Button className="flex gap-2"><Cog /> Configurar cardápio</Button>
            </CardFooter>
        </Card>
    )
}

export default function ListagemCardapio() {
    const [importacaoDropdownStatus, setImportacaoDropdownStatus] = useState(false)
    const [toggleDrawerCUCardapio, setToggleDrawerCUCardapio] = useState(false)
    const [cardapioSelecionado, setCardapioSelecionado] = useState<ICardapio | undefined>()
    const [modoDrawer, setModoDrawer] = useState<'create' | 'update'>('create')
    const [dialogRemoverOpen, setDialogRemoverOpen] = useState(false)
    const [cardapioParaRemover, setCardapioParaRemover] = useState<ICardapio | undefined>()
    const [dialogClonarOpen, setDialogClonarOpen] = useState(false)
    const [cardapioParaClonar, setCardapioParaClonar] = useState<ICardapio | undefined>()
    const [dialogExportacaoOpen, setDialogExportacaoOpen] = useState(false)
    const [cardapioParaExportar, setCardapioParaExportar] = useState<ICardapio | undefined>()
    const [dialogImportarIfood, setDialogImportarIfood] = useState(false)

    const {existeTokensIFOOD, existeTokenAnotaai, cardapios, cnpj} = usePage<{
        existeTokensIFOOD: boolean,
        existeTokenAnotaai: boolean,
        cardapios: ICardapio[],
        cnpj: string
    }>().props

    const DROPDOWNS_DATA: IDropdownData[] = [
        {
            open: importacaoDropdownStatus,
            onOpenChange: setImportacaoDropdownStatus,
            label: "Importação",
            items: [
                {
                    label: "Importar cardápio AnotaAI",
                    tag: 'anotaai',
                    action: () => {}
                },
                {
                    label: "Importar cardápio IFOOD",
                    tag: 'ifood',
                    action: () => setDialogImportarIfood(true)
                },
            ]
        },
    ]

    async function consultaDadosCardapio(cardapio_id: number) {
        try {
            const response = await axios.get(route('aplicacao.empresa.cardapios.show', {cnpj, cardapio_id}))
            return response.data.cardapio
        } catch (error: any) {
            toast.error(error?.response?.data?.message ?? 'Erro ao consultar cardápio.')
            return null;
        }
    }

    function abrirCriacao() {
        setModoDrawer('create')
        setCardapioSelecionado(undefined)
        setToggleDrawerCUCardapio(true)
    }

    async function abrirEdicao(cardapio_id: number) {
        const cardapio = await consultaDadosCardapio(cardapio_id)
        if (!cardapio) return;

        setModoDrawer('update')
        setCardapioSelecionado(cardapio)
        setToggleDrawerCUCardapio(true)
    }

    async function abrirExportacao(cardapio_id: number) {
        const cardapio = await consultaDadosCardapio(cardapio_id)
        if (!cardapio) return;

        setCardapioParaExportar(cardapio)
        setDialogExportacaoOpen(true)
    }

    async function abrirRemocao(cardapio_id: number) {
        const cardapio = await  consultaDadosCardapio(cardapio_id)
        if (!cardapio) return

        setCardapioParaRemover(cardapio)
        setDialogRemoverOpen(true)
    }

    async function abrirClonagem(cardapio_id: number) {
        const cardapio = await consultaDadosCardapio(cardapio_id)
        if (!cardapio) return;
        setCardapioParaClonar(cardapio)
        setDialogClonarOpen(true)
    }

    return (
        <LayoutAutenticado>
            <Card>
                <CardHeader>
                    <CardTitle>Cardápios</CardTitle>
                    <CardDescription>
                        Seu cardápio é a vitrine dos seus produtos no Safi
                        Delivery. Agora, você pode atender seus clientes de
                        diversas formas, criando e disponibilizando cardápios
                        personalizados para cada ocasião. Aproveite essa
                        flexibilidade para oferecer uma experiência única e
                        conquistar ainda mais clientes!
                    </CardDescription>
                    <div className="flex flex-col-reverse md:flex md:flex-row-reverse gap-4">
                        <Button onClick={(e) => {
                            e.currentTarget.blur()
                            abrirCriacao()
                        }}>
                            Cadastrar cardápio
                        </Button>
                        <DropdownsListagemCardapio data={DROPDOWNS_DATA} existeTokenAnotaai={existeTokenAnotaai} existeTokensIFOOD={existeTokensIFOOD}/>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4 mb-4">
                    {cardapios.map(cardapio => (
                        <CardCardapio
                            data={cardapio}
                            key={cardapio.id}
                            cnpj={cnpj}
                            callRemocao={abrirRemocao}
                            callEdicao={abrirEdicao}
                            callExport={abrirExportacao}
                            callClone={abrirClonagem}
                        />
                    ))}
                </CardContent>
            </Card>
            <DrawerCUCardapio open={toggleDrawerCUCardapio} onOpenChange={setToggleDrawerCUCardapio} mode={modoDrawer} dados={cardapioSelecionado}/>
            <DialogRemoverCardapio open={dialogRemoverOpen} onOpenChange={setDialogRemoverOpen} cardapio={cardapioParaRemover} />
            <DialogClonarCardapio open={dialogClonarOpen} onOpenChange={setDialogClonarOpen} cardapio={cardapioParaClonar} />
            <DialogExportarCardapio open={dialogExportacaoOpen} onOpenChange={setDialogExportacaoOpen} cardapio={cardapioParaExportar} />
            <DialogImportarIfood open={dialogImportarIfood} onOpenChange={setDialogImportarIfood} />
        </LayoutAutenticado>
    );
}
