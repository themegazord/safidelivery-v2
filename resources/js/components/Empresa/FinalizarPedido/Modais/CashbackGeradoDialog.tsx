import { PartyPopper } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { converteReal } from "@/utils/utils";

interface IProps {
    aberto: boolean;
    cashbackGerado: number;
    onContinuar: () => void;
}

export default function CashbackGeradoDialog({
    aberto,
    cashbackGerado,
    onContinuar,
}: IProps) {
    return (
        <Dialog open={aberto} onOpenChange={(open) => !open && onContinuar()}>
            <DialogContent className="sm:max-w-md" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PartyPopper className="size-4 text-primary" />
                        Você ganhou cashback!
                    </DialogTitle>
                    <DialogDescription>
                        Seu pedido foi realizado com sucesso e você acumulou{" "}
                        <span className="font-semibold text-primary">
                            R$ {converteReal(cashbackGerado)}
                        </span>{" "}
                        de cashback para usar nos próximos pedidos.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button onClick={onContinuar}>Continuar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
