import DialogClonarCardapio from "@/components/Empresa/Cardapios/DialogClonarCardapio";
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
import { ChevronDown, ChevronUp, Cog, Copy, EllipsisVertical, SquarePen, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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



function DropdownsListagemCardapio({data, existeTokenAnotaai}: {data: IDropdownData[], existeTokenAnotaai: boolean}) {
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
                            <DropdownMenuItem key={diIdx} onClick={di.action} disabled={(di.tag === 'anotaai' && !existeTokenAnotaai)}>{di.label}</DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            ))}
        </>
    )
}

function CardCardapio({data, cnpj, callEdicao, callClone, callRemocao}: {
    data: ICardapio,
    cnpj: string, 
    callEdicao: (value: number) => void,
    callClone: (value: number) => void,
    callRemocao: (value: number) => void,
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{data.nome}</CardTitle>
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
    const [exportacaoDropdownStatus, setExportacaoDropdownStatus] = useState(false)
    const [importacaoDropdownStatus, setImportacaoDropdownStatus] = useState(false)
    const [toggleDrawerCUCardapio, setToggleDrawerCUCardapio] = useState(false)
    const [cardapioSelecionado, setCardapioSelecionado] = useState<ICardapio | undefined>()
    const [modoDrawer, setModoDrawer] = useState<'create' | 'update'>('create')
    const [dialogRemoverOpen, setDialogRemoverOpen] = useState(false)
    const [cardapioParaRemover, setCardapioParaRemover] = useState<ICardapio | undefined>()
    const [dialogClonarOpen, setDialogClonarOpen] = useState(false)
    const [cardapioParaClonar, setCardapioParaClonar] = useState<ICardapio | undefined>()

    const {existeTokenAnotaai, cardapios, cnpj} = usePage<{
        existeTokenAnotaai: boolean,
        cardapios: ICardapio[],
        cnpj: string
    }>().props

    const DROPDOWNS_DATA: IDropdownData[] = [
        {
            open: exportacaoDropdownStatus,
            onOpenChange: setExportacaoDropdownStatus,
            label: "Exportação",
            items: [
                {
                    label: "PDF",
                    tag: 'pdf',
                    action: () => {}
                }
            ]
        },
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
                    action: () => {}
                },
            ]
        }
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
                        <DropdownsListagemCardapio data={DROPDOWNS_DATA} existeTokenAnotaai={existeTokenAnotaai}/>
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
                            callClone={abrirClonagem}
                        />
                    ))}
                </CardContent>
            </Card>
            <DrawerCUCardapio open={toggleDrawerCUCardapio} onOpenChange={setToggleDrawerCUCardapio} mode={modoDrawer} dados={cardapioSelecionado}/>
            <DialogRemoverCardapio open={dialogRemoverOpen} onOpenChange={setDialogRemoverOpen} cardapio={cardapioParaRemover} />
            <DialogClonarCardapio open={dialogClonarOpen} onOpenChange={setDialogClonarOpen} cardapio={cardapioParaClonar} />
        </LayoutAutenticado>
    );
}
