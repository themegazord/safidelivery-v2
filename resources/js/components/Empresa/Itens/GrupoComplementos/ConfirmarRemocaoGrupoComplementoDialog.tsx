import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface IProps {
    open: boolean
    onOpenChange: (value: boolean) => void
    onSubmit: () => void
    loading: boolean
    grupo: { id: number; nome?: string } | undefined
}

export default function ConfirmarRemocaoGrupoComplementoDialog({ open, onOpenChange, grupo, onSubmit, loading }: IProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Remover grupo de complementos?</DialogTitle>
                    <DialogDescription>Isso removerá definitivamente este grupo e todos os complementos dele.</DialogDescription>
                </DialogHeader>
                <p>Deseja remover o grupo <b>"{grupo?.nome}"</b>?</p>
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
