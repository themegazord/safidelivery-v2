import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { H1 } from "@/components/utils/Heading";
import { ConciergeBell, Motorbike } from "lucide-react";

interface IProps {
    temTokenIfood: boolean;
    checkedValue: boolean;
    setCheckedValue: (valor: boolean) => void;
    fnCopiar: (link: string) => void;
    linkDelivery: string;
    linkMesa: string;
}

export default function HeaderDesempenho({
    temTokenIfood,
    checkedValue,
    setCheckedValue,
    fnCopiar,
    linkDelivery,
    linkMesa,
}: IProps) {
    return (
        <section className="my-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <H1 className="font-bold">Painel de desempenho</H1>
                <p className="text-base-content/70">
                    Visão geral do seu negócio
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                {temTokenIfood && (
                    <div className="flex gap-2">
                        <Switch
                            checked={checkedValue}
                            onCheckedChange={(valor) => setCheckedValue(valor)}
                            id="esta-recebendo-ifood"
                        />
                        <Label htmlFor="esta-recebendo-ifood">
                            Está recebendo pedidos do IFood?
                        </Label>
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="lg"
                                className="cursor-pointer"
                                onClick={() => fnCopiar(linkDelivery)}
                            >
                                <Motorbike className="size-6" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Link para Delivery</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="lg"
                                className="cursor-pointer"
                                onClick={() => fnCopiar(linkMesa)}
                            >
                                <ConciergeBell className="size-6" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Link para atendimento em mesa
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </section>
    );
}
