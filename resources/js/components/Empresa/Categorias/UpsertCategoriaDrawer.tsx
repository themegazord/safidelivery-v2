import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface IProps {
    open: boolean;
    onOpenChange: (value: boolean) => void
    mode: 'create' | 'update' | undefined
}

export default function UpsertCategoriaDrawer({ open, onOpenChange, mode }: IProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent className="w-full md:w-[55vw]">
                <DrawerHeader>
                    <DrawerTitle>{mode === 'create' ? 'Nova categoria' : 'Editar categoria'}</DrawerTitle>
                    <DrawerDescription>{mode === 'create' ? 'Selecione o modelo de categoria para dividir o seu cardápio' : 'Detalhes da categoria'}</DrawerDescription>
                </DrawerHeader>
            </DrawerContent>
        </Drawer>
    );
}
