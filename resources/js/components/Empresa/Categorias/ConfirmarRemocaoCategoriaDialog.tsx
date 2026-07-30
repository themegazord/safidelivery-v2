import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { CategoriaFormData } from "./UpsertCategoriaDrawer";

interface IProps {
    open: boolean
    onOpenChange: (value: boolean) => void
    onSubmit: (categoria_id: number) => void
    loading: boolean
    categoria: (Partial<CategoriaFormData> & { id: number; }) | undefined
}

export default function ConfirmarRemocaoCategoriaDialog({open, onOpenChange, categoria, onSubmit, loading}: IProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Remover categoria?</DialogTitle>
                    <DialogDescription>Isso removerá definitivamente está categoria.</DialogDescription>
                </DialogHeader>
                <p>Deseja remover essa categoria: <b>"{categoria?.nome}"</b>?</p>
                <DialogFooter className="flex flex-row-reverse gap-4">
                    <DialogClose render={<Button variant={"default"} />}>Cancelar</DialogClose>
                    <Button variant={"destructive"} onClick={() => onSubmit(categoria?.id ?? 0)}>
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
