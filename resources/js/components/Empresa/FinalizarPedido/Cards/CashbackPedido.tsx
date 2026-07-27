import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { converteReal } from "@/utils/utils";

interface IProps {
    cashbackDisponivel: number;
    usarCashback: boolean;
    setUsarCashback: (value: boolean) => void;
}

export default function CashbackPedido({
    cashbackDisponivel,
    usarCashback,
    setUsarCashback,
}: IProps) {
    if (cashbackDisponivel <= 0) {
        return null;
    }

    return (
        <Card>
            <CardContent className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <Wallet className="size-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">
                            Usar cashback disponível
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Você tem{" "}
                            <span className="font-semibold text-primary">
                                R$ {converteReal(cashbackDisponivel)}
                            </span>{" "}
                            de cashback para usar neste pedido.
                        </p>
                    </div>
                </div>
                <Switch
                    checked={usarCashback}
                    onCheckedChange={setUsarCashback}
                />
            </CardContent>
        </Card>
    );
}
