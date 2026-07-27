import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { IPromocao } from "@/types/empresa/promocoes/types";

type ModalRemoverCupomProps = {
    aberto: boolean;
    onOpenChange: (aberto: boolean) => void;
    cupom: IPromocao | null;
    onConfirmar: () => void;
    removendo: boolean;
};

export default function ModalRemoverCupom({
    aberto,
    onOpenChange,
    cupom,
    onConfirmar,
    removendo,
}: ModalRemoverCupomProps) {
    if (!cupom) {
        return null;
    }

    return (
        <Dialog open={aberto} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader className="items-center text-center">
                    <div className="mb-2 inline-flex rounded-2xl bg-destructive/10 p-4">
                        <Trash2 className="size-8 text-destructive" />
                    </div>
                    <DialogTitle>Excluir Cupom</DialogTitle>
                    <DialogDescription>
                        Esta ação não pode ser desfeita
                    </DialogDescription>
                </DialogHeader>

                <p className="text-center text-sm text-foreground">
                    O cupom{" "}
                    <span className="font-mono font-bold text-destructive">
                        {cupom.nome_cupom}
                    </span>{" "}
                    será excluído permanentemente!
                </p>

                <DialogFooter className="sm:justify-center">
                    <Button
                        variant="destructive"
                        onClick={onConfirmar}
                        disabled={removendo}
                    >
                        {removendo ? <Spinner /> : <Trash2 />}
                        Confirmar Exclusão
                    </Button>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
