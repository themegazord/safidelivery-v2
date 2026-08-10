import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface IProps {
    open: boolean
    onOpenChange: (value: boolean) => void
    onSubmit: () => void
    loading: boolean
    item: { id: number; nome?: string } | undefined
}

export default function ConfirmarRemocaoItemDialog({ open, onOpenChange, item, onSubmit, loading }: IProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Remover item?</DialogTitle>
                    <DialogDescription>Isso removerá definitivamente este item.</DialogDescription>
                </DialogHeader>
                <p>Deseja remover o item <b>"{item?.nome}"</b>?</p>
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
