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

export default function ConfirmarClonagemCategoriaDialog({open, onOpenChange, categoria, onSubmit, loading}: IProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Clonar categoria?</DialogTitle>
                    <DialogDescription>Isso criará uma cópia da categoria.</DialogDescription>
                </DialogHeader>
                <p>Deseja clonar essa categoria: <b>"{categoria?.nome}"</b>?</p>
                <DialogFooter className="flex flex-row-reverse gap-4">
                    <DialogClose render={<Button variant={"destructive"} />}>Cancelar</DialogClose>
                    <Button onClick={() => onSubmit(categoria?.id ?? 0)}>
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
