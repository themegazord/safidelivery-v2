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

export default function ConfirmarClonagemItemDialog({ open, onOpenChange, item, onSubmit, loading }: IProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Clonar item?</DialogTitle>
                    <DialogDescription>Isso criará uma cópia do item.</DialogDescription>
                </DialogHeader>
                <p>Deseja clonar o item <b>"{item?.nome}"</b>?</p>
                <DialogFooter className="flex flex-row-reverse gap-4">
                    <DialogClose render={<Button variant={"destructive"} />}>Cancelar</DialogClose>
                    <Button onClick={onSubmit} disabled={loading}>
                        {
                            loading
                                ? <><Spinner /> Clonando...</>
                                : 'Clonar'
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
