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
    timezone: string;
}

export default function CashbackResumoCard({ cashbackResumo, timezone }: IProps) {
    const [aberto, setAberto] = useState(false);

    if (cashbackResumo.gerado <= 0) {
        return null;
    }

    return (
        <Card className="border-emerald-600/30 bg-emerald-600/5">
            <Collapsible open={aberto} onOpenChange={setAberto}>
                <CardHeader className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                        <Undo2 className="size-5 text-emerald-600" />
                        Meu Cashback
                    </CardTitle>
                    <CollapsibleTrigger className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                        {aberto ? "Ocultar detalhes" : "Ver detalhes"}
                        <ChevronDown className={`size-3.5 transition-transform ${aberto ? "rotate-180" : ""}`} />
                    </CollapsibleTrigger>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Stats
                            title="Disponível"
                            value={`R$ ${converteReal(cashbackResumo.disponivel)}`}
                            icon={<Banknote className="size-5" />}
                            color="green"
                        />
                        <Stats
                            title="Aguardando"
                            value={`R$ ${converteReal(cashbackResumo.pendente)}`}
                            icon={<Clock className="size-5" />}
                            color="amber"
                        />
                        <Stats
                            title="Utilizado"
                            value={`R$ ${converteReal(cashbackResumo.usado)}`}
                            icon={<CheckCircle2 className="size-5" />}
                            color="blue"
                        />
                        <Stats
                            title="Expirado"
                            value={`R$ ${converteReal(cashbackResumo.vencido)}`}
                            icon={<XCircle className="size-5" />}
                            color="red"
                        />
                    </div>

                    <CollapsibleContent className="flex flex-col gap-2">
                        {cashbackResumo.proximos_vencimentos.length === 0 ? (
                            <p className="py-2 text-center text-sm text-muted-foreground">
                                Nenhum crédito disponível no momento.
                            </p>
                        ) : (
                            cashbackResumo.proximos_vencimentos.map((credito, idx) => (
                                <ProximoVencimentoCashbackItem
                                    key={`${credito.pedido_id}-${idx}`}
                                    credito={credito}
                                    timezone={timezone}
                                />
                            ))
                        )}
                    </CollapsibleContent>
                </CardContent>
            </Collapsible>
        </Card>
    );
}
