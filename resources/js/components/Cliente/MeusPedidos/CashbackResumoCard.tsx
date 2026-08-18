import { useState } from "react";
import { Banknote, ChevronDown, Undo2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ICashbackResumoCliente } from "@/types/cliente/pedidos";
import { converteReal } from "@/utils/utils";
import { formatarDataHora } from "@/utils/pedidos";

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
                    <div className="flex items-center gap-2">
                        <Undo2 className="size-5 text-emerald-600" />
                        <span className="font-semibold">Meu Cashback</span>
                    </div>
                    <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                        {aberto ? "Ocultar detalhes" : "Ver detalhes"}
                        <ChevronDown className={`size-3.5 transition-transform ${aberto ? "rotate-180" : ""}`} />
                    </CollapsibleTrigger>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                        <div className="rounded-lg bg-emerald-600/10 p-3">
                            <p className="text-xs text-muted-foreground">Disponível</p>
                            <p className="text-lg font-bold text-emerald-600">
                                R$ {converteReal(cashbackResumo.disponivel)}
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted p-3">
                            <p className="text-xs text-muted-foreground">Aguardando</p>
                            <p className="text-lg font-bold">
                                R$ {converteReal(cashbackResumo.pendente)}
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted p-3">
                            <p className="text-xs text-muted-foreground">Utilizado</p>
                            <p className="text-lg font-bold">
                                R$ {converteReal(cashbackResumo.usado)}
                            </p>
                        </div>
                        <div className="rounded-lg bg-destructive/10 p-3">
                            <p className="text-xs text-muted-foreground">Expirado</p>
                            <p className="text-lg font-bold text-destructive">
                                R$ {converteReal(cashbackResumo.vencido)}
                            </p>
                        </div>
                    </div>

                    <CollapsibleContent className="mt-3 space-y-2">
                        {cashbackResumo.proximos_vencimentos.length === 0 ? (
                            <p className="py-2 text-center text-sm text-muted-foreground">
                                Nenhum crédito disponível no momento.
                            </p>
                        ) : (
                            cashbackResumo.proximos_vencimentos.map((credito, idx) => {
                                const vencimento = new Date(credito.data_vencimento);
                                const diasParaVencer = Math.ceil(
                                    (vencimento.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                                );

                                return (
                                    <div
                                        key={`${credito.pedido_id}-${idx}`}
                                        className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Banknote className="size-4 text-emerald-600" />
                                            <span className="font-medium text-emerald-600">
                                                R$ {converteReal(credito.saldo_restante)}
                                            </span>
                                            {credito.pedido_id && (
                                                <span className="text-xs text-muted-foreground">
                                                    · Pedido #{credito.pedido_id}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Vence em</p>
                                            <p
                                                className={`text-xs font-medium ${diasParaVencer <= 7 ? "text-amber-600" : "text-foreground/70"}`}
                                            >
                                                {formatarDataHora(credito.data_vencimento, timezone).split(" ")[0]}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CollapsibleContent>
                </CardContent>
            </Collapsible>
        </Card>
    );
}
