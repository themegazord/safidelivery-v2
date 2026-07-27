import { Check, Gift, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { converteReal } from "@/utils/utils";
import {
    IProgressoFidelidade,
    IRecompensaFidelidade,
} from "@/types/finalizar-pedido/fidelidade";

interface IProps {
    progressoFidelidade: IProgressoFidelidade | null;
    recompensaFidelidade: IRecompensaFidelidade | null;
    resgatado: boolean;
    onResgatar: () => void;
}

function labelRecompensa(recompensa: IRecompensaFidelidade): string {
    switch (recompensa.tipo) {
        case "item_gratis":
            return "Item grátis";
        case "frete_gratis":
            return "Frete grátis";
        case "desconto_percentual":
            return `${recompensa.valor}% de desconto`;
        case "desconto_fixo":
            return `R$ ${converteReal(recompensa.valor ?? 0)} de desconto`;
    }
}

export default function FidelidadePedido({
    progressoFidelidade,
    recompensaFidelidade,
    resgatado,
    onResgatar,
}: IProps) {
    if (!recompensaFidelidade && !progressoFidelidade) {
        return null;
    }

    return (
        <Card>
            <CardContent>
                {recompensaFidelidade ? (
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Gift className="size-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    {resgatado
                                        ? "Recompensa será aplicada ao pedido"
                                        : "Recompensa de fidelidade disponível!"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {labelRecompensa(recompensaFidelidade)}
                                </p>
                            </div>
                        </div>
                        {resgatado ? (
                            <Check className="size-5 shrink-0 text-primary" />
                        ) : (
                            <Button size="sm" onClick={onResgatar}>
                                Resgatar
                            </Button>
                        )}
                    </div>
                ) : (
                    progressoFidelidade && (
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Star className="size-4 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="mb-1 text-sm font-medium">
                                    Progresso de fidelidade
                                </p>
                                <p className="mb-2 text-sm text-muted-foreground">
                                    {progressoFidelidade.tipo_gatilho ===
                                    "qtd_pedidos"
                                        ? `${progressoFidelidade.atual} de ${progressoFidelidade.meta} pedidos`
                                        : `R$ ${converteReal(progressoFidelidade.atual)} de R$ ${converteReal(progressoFidelidade.meta)}`}
                                </p>
                                <Progress
                                    value={Math.min(
                                        100,
                                        (progressoFidelidade.atual /
                                            progressoFidelidade.meta) *
                                            100,
                                    )}
                                />
                            </div>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    );
}
