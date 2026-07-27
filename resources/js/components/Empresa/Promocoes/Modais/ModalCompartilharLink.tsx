import { Clipboard, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { IPromocao } from "@/types/empresa/promocoes/types";

type ModalCompartilharLinkProps = {
    aberto: boolean;
    onOpenChange: (aberto: boolean) => void;
    cupom: IPromocao | null;
    interacaoId: string;
};

export default function ModalCompartilharLink({
    aberto,
    onOpenChange,
    cupom,
    interacaoId,
}: ModalCompartilharLinkProps) {
    if (!cupom) {
        return null;
    }

    const link = `${window.location.origin}/loja/${interacaoId}?cupom=${cupom.nome_cupom}`;

    async function copiarLink() {
        await navigator.clipboard.writeText(link);
        toast.success("Link com cupom copiado");
        onOpenChange(false);
    }

    return (
        <Dialog open={aberto} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="items-center text-center">
                    <div className="mb-2 inline-flex rounded-2xl bg-primary/10 p-4">
                        <LinkIcon className="size-8 text-primary" />
                    </div>
                    <DialogTitle>Compartilhar Cupom</DialogTitle>
                    <DialogDescription>
                        Link com cupom{" "}
                        <span className="font-mono font-bold text-primary">
                            {cupom.nome_cupom}
                        </span>{" "}
                        já aplicado
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
                    <p className="break-all font-mono text-sm text-foreground">
                        {link}
                    </p>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button onClick={copiarLink}>
                        <Clipboard /> Copiar Link
                    </Button>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
