import { useEffect, useState } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GripVertical, Info } from "lucide-react";
import { ICategoria } from "@/types/empresa/cardapios/types";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface GerenciarOrdenacaoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categorias: ICategoria[];
    onOrdenar: (categoriasOrdenadas: ICategoria[]) => void;
}

// ---------------------------------------------------------------------------
// Item arrastável
// ---------------------------------------------------------------------------

function CategoriaSortableItem({
    categoria,
    ordem,
}: {
    categoria: ICategoria;
    ordem: number;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: categoria.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group rounded-lg border-2 bg-card transition-all duration-200 hover:border-primary hover:shadow-lg ${
                isDragging ? "rotate-2 opacity-50" : "border-border"
            }`}
        >
            <div className="flex items-center gap-4 p-4">
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-grab rounded-lg p-2 transition-colors hover:bg-accent active:cursor-grabbing group-hover:bg-accent"
                >
                    <GripVertical className="h-5 w-5" />
                </button>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {ordem}
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-semibold">{categoria.nome}</h3>
                    {categoria.descricao && (
                        <p className="text-sm text-muted-foreground">
                            {categoria.descricao}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

export function GerenciarOrdenacaoDialog({
    open,
    onOpenChange,
    categorias,
    onOrdenar,
}: GerenciarOrdenacaoDialogProps) {
    const [itens, setItens] = useState<ICategoria[]>(categorias);

    // Ressincroniza a lista local sempre que o modal recebe categorias novas
    // (ex.: reabrir depois de fechado, ou dado atualizado vindo do pai)
    useEffect(() => {
        setItens(categorias);
    }, [categorias]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setItens((prev) => {
            const oldIndex = prev.findIndex((c) => c.id === active.id);
            const newIndex = prev.findIndex((c) => c.id === over.id);
            const novaOrdem = arrayMove(prev, oldIndex, newIndex);
            onOrdenar(novaOrdem);
            return novaOrdem;
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Gerenciar Ordem das Categorias</DialogTitle>
                </DialogHeader>

                <div className="mb-2 rounded-lg bg-blue-500/10 p-4">
                    <div className="flex items-center gap-3">
                        <Info className="h-6 w-6 shrink-0 text-blue-500" />
                        <div>
                            <p className="font-semibold">
                                Arraste e solte para reorganizar
                            </p>
                            <p className="text-sm text-muted-foreground">
                                A ordem será salva automaticamente
                            </p>
                        </div>
                    </div>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={itens.map((c) => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
                            {itens.map((categoria, idx) => (
                                <CategoriaSortableItem
                                    key={categoria.id}
                                    categoria={categoria}
                                    ordem={idx + 1}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <DialogFooter className="flex w-full flex-row items-center justify-between sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Total: {itens.length} categorias
                    </p>
                    <Button onClick={() => onOpenChange(false)}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default GerenciarOrdenacaoDialog;