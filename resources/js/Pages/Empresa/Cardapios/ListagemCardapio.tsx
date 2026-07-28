import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface IDropdownData {
    open: boolean,
    onOpenChange: (value: boolean) => void,
    label: string,
    items: TDropdownItemData[]
}

type TDropdownItemData = {
    label: string,
    action: () => void
}

function DropdownsListagemCardapio({data}: {data: IDropdownData[]}) {
    return (
        <>
            {data.map(d => (
                <DropdownMenu open={d.open} onOpenChange={d.onOpenChange}>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"outline"}>
                            <span className="flex gap-2 items-center">{d.label} {!d.open ? <ChevronDown /> : <ChevronUp />}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {d.items.map((di, diIdx)=> (
                            <DropdownMenuItem key={diIdx} onClick={di.action}>{di.label}</DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            ))}
        </>
    )
}

export default function ListagemCardapio() {
    const [exportacaoDropdownStatus, setExportacaoDropdownStatus] = useState(false)
    const [importacaoDropdownStatus, setImportacaoDropdownStatus] = useState(false)

    const DROPDOWNS_DATA: IDropdownData[] = [
        {
            open: exportacaoDropdownStatus,
            onOpenChange: setExportacaoDropdownStatus,
            label: "Exportação",
            items: [
                {
                    label: "PDF",
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
                    action: () => {}
                },
                {
                    label: "Importar cardápio IFOOD",
                    action: () => {}
                },
            ]
        }
    ]

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
                        <Button>Cadastrar cardápio</Button>
                        <DropdownsListagemCardapio data={DROPDOWNS_DATA} />
                    </div>
                </CardHeader>
                <Separator />
            </Card>
        </LayoutAutenticado>
    );
}
