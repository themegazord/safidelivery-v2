import { useState } from "react";
import { Banknote, CheckCircle2, ChevronDown, Clock, Undo2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Stats from "@/components/utils/Stats";
import { ICashbackResumoCliente } from "@/types/cliente/pedidos";
import { converteReal } from "@/utils/utils";
import ProximoVencimentoCashbackItem from "./ProximoVencimentoCashbackItem";

interface IProps {
    cashbackResumo: ICashbackResumoCliente;
}

export default function CashbackResumoCard({ cashbackResumo }: IProps) {
    const [aberto, setAberto] = useState(false);

    if (cashbackResumo.gerado <= 0) {
        return null;
    }

    return (
        <Card className="overflow-hidden border-border/60">
            <Collapsible open={aberto} onOpenChange={setAberto}>
                <CardHeader className="gap-3 border-b">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Banknote className="size-4" />
                                </span>
                                Meu Cashback
                            </CardTitle>
                            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
                                R$ {converteReal(cashbackResumo.disponivel)}
                            </p>
                            <p className="text-xs text-muted-foreground">disponível para usar</p>
                        </div>

                        <CollapsibleTrigger className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                            {aberto ? "Ocultar detalhes" : "Ver detalhes"}
                            <ChevronDown
                                className={`size-4 transition-transform duration-200 ${
                                    aberto ? "rotate-180" : ""
                                }`}
                            />
                        </CollapsibleTrigger>
                    </div>
                </CardHeader>

                <CollapsibleContent>
                    <CardContent className="flex flex-col gap-5 pt-5">
                        <div className="grid grid-cols-2 gap-2">
                            <Stats
                                title="Gerado"
                                value={`R$ ${converteReal(cashbackResumo.gerado)}`}
                                icon={<CheckCircle2 className="size-4" />}
                                color="green"
                            />
                            <Stats
                                title="Disponível"
                                value={`R$ ${converteReal(cashbackResumo.disponivel)}`}
                                icon={<Clock className="size-4" />}
                                color="amber"
                            />
                            <Stats
                                title="Utilizado"
                                value={`R$ ${converteReal(cashbackResumo.usado)}`}
                                icon={<Undo2 className="size-4" />}
                                color="blue"
                            />
                            <Stats
                                title="Expirado"
                                value={`R$ ${converteReal(cashbackResumo.vencido)}`}
                                icon={<XCircle className="size-4" />}
                                color="red"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Próximos vencimentos
                            </p>

                            {cashbackResumo.proximos_vencimentos.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                                    Nenhum crédito disponível no momento.
                                </div>
                            ) : (
                                <ul className="divide-y rounded-lg border">
                                    {cashbackResumo.proximos_vencimentos.map((credito, idx) => (
                                        <li key={idx} className="px-3 py-2">
                                            <ProximoVencimentoCashbackItem credito={credito}/>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
