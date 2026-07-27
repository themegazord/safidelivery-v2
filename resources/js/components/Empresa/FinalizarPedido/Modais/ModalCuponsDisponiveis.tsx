import { CheckCircle2, Percent, ShoppingBag, Ticket, Truck } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { converteReal } from "@/utils/utils";
import { ICupomAplicado, ICupomVisivel } from "@/types/finalizar-pedido/cupom";

interface IProps {
    aberto: boolean;
    onOpenChange: (aberto: boolean) => void;
    cuponsVisiveis: ICupomVisivel[];
    cupomAplicado: ICupomAplicado | null;
    onSelecionar: (nomeCupom: string) => void;
}

export default function ModalCuponsDisponiveis({
    aberto,
    onOpenChange,
    cuponsVisiveis,
    cupomAplicado,
    onSelecionar,
}: IProps) {
    return (
        <Dialog open={aberto} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Ticket className="size-4 text-primary" />
                        Cupons disponíveis
                    </DialogTitle>
                    <DialogDescription>
                        Selecione um cupom para aplicar no seu pedido
                    </DialogDescription>
                </DialogHeader>

                <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
                    {cuponsVisiveis.map((cupom) => {
                        const aplicado =
                            cupomAplicado?.nome_cupom === cupom.nome_cupom;
                        const label =
                            cupom.tipo_cupom === "porcentagem"
                                ? `${cupom.valor_desconto}% de desconto`
                                : `R$ ${converteReal(cupom.valor_desconto)} de desconto`;

                        return (
                            <button
                                key={cupom.nome_cupom}
                                type="button"
                                onClick={() => {
                                    onSelecionar(cupom.nome_cupom);
                                    onOpenChange(false);
                                }}
                                className={cn(
                                    "flex items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 text-left transition",
                                    aplicado
                                        ? "border-primary bg-primary/10"
                                        : "border-border hover:border-primary/50 hover:bg-primary/5",
                                )}
                            >
                                <div>
                                    <p className="font-mono text-sm font-bold text-primary">
                                        {cupom.nome_cupom}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {label}
                                    </p>
                                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                        {cupom.onde_afetara === "produto" ? (
                                            <>
                                                <ShoppingBag className="size-3" />
                                                Aplica nos produtos
                                            </>
                                        ) : (
                                            <>
                                                <Truck className="size-3" />
                                                Aplica no frete
                                            </>
                                        )}
                                    </p>
                                </div>
                                {aplicado ? (
                                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                                ) : (
                                    <Percent className="size-5 shrink-0 text-muted-foreground/50" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
