import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface IProps {
    open: boolean
    onOpenChange: (value: boolean) => void
    onSubmit: () => void
    loading: boolean
    complemento: { id: number; nome?: string } | undefined
}

export default function ConfirmarRemocaoComplementoDialog({ open, onOpenChange, complemento, onSubmit, loading }: IProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Remover complemento?</DialogTitle>
                    <DialogDescription>Isso removerá definitivamente este complemento.</DialogDescription>
                </DialogHeader>
                <p>Deseja remover o complemento <b>"{complemento?.nome}"</b>?</p>
                <DialogFooter className="flex flex-row-reverse gap-4">
                    <DialogClose render={<Button variant={"default"} />}>Cancelar</DialogClose>
                    <Button variant={"destructive"} onClick={onSubmit} disabled={loading}>
                        {
                            loading
                                ? <><Spinner /> Removendo...</>
                                : 'Remover'
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
