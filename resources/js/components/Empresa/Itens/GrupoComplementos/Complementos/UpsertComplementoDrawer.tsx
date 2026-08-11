import { useState } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Link } from "lucide-react";
import { cn } from "@/lib/utils";

type TModoCriacaoGrupo = "criar" | "copiar";

const OPCOES_CRIACAO_GRUPO: {
    value: TModoCriacaoGrupo;
    icon: React.ReactNode;
    title: string;
    badge?: string;
    description: string;
}[] = [
    {
        value: "criar",
        icon: <Plus className="size-4" />,
        title: "Criar novo grupo",
        description: "Você cria um grupo novo, definindo informações gerais e quais serão os complementos",
    },
    {
        value: "copiar",
        icon: <Link className="size-4" />,
        title: "Copiar grupo",
        badge: "mais prático",
        description: "Você reaproveita um grupo que já possui em seu cardápio e a gestão fica mais fácil!",
    },
];

interface IProps {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export default function UpsertComplementoDrawer({ open, setOpen }: IProps) {
    const [modoCriacaoGrupo, setModoCriacaoGrupo] = useState<
        TModoCriacaoGrupo | undefined
    >(undefined);
    return (
        <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
            {modoCriacaoGrupo === undefined && (
                <DrawerContent className="w-full p-6 lg:w-[55vw]">
                    <DrawerHeader>
                        <DrawerTitle>Novo grupo de complementos</DrawerTitle>
                        <DrawerDescription>
                            Crie um grupo e adicione os complementos que ele vai
                            oferecer, como opções extras, acompanhamentos ou
                            variações do item.
                        </DrawerDescription>
                    </DrawerHeader>
                    <RadioGroup
                        value={modoCriacaoGrupo}
                        onValueChange={(value) => setModoCriacaoGrupo(value as TModoCriacaoGrupo)}
                        className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2"
                    >
                        {OPCOES_CRIACAO_GRUPO.map((opcao) => (
                            <Label key={opcao.value} htmlFor={`modo_criacao_grupo_${opcao.value}`}>
                                <Card
                                    className={cn(
                                        "cursor-pointer transition-shadow",
                                        modoCriacaoGrupo === opcao.value && "ring-2 ring-primary",
                                    )}
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            {opcao.icon}
                                            {opcao.title}
                                            {opcao.badge && <Badge variant="secondary">{opcao.badge}</Badge>}
                                        </CardTitle>
                                        <CardAction>
                                            <RadioGroupItem value={opcao.value} id={`modo_criacao_grupo_${opcao.value}`} />
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{opcao.description}</p>
                                    </CardContent>
                                </Card>
                            </Label>
                        ))}
                    </RadioGroup>
                </DrawerContent>
            )}
        </Drawer>
    );
}
