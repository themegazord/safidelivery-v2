import { useMemo, useState } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { IPedido, IConfiguracoesPedidos, TStatusPedido } from "@/types/empresa/pedidos/types";
import { GripVertical } from "lucide-react";
import PedidoCard from "./PedidoCard";

type TColuna = "pendente" | "sendo_preparado" | "pronto_para_entrega";

const COLUNAS: { id: TColuna; titulo: string; corHeader: string; corBg: string }[] = [
    { id: "pendente", titulo: "Em análise", corHeader: "bg-orange-700", corBg: "bg-orange-600" },
    { id: "sendo_preparado", titulo: "Em produção", corHeader: "bg-yellow-700", corBg: "bg-yellow-600" },
    { id: "pronto_para_entrega", titulo: "Pronto para entrega", corHeader: "bg-green-700", corBg: "bg-green-600" },
];

function colunaDoPedido(status: TStatusPedido): TColuna | null {
    if (status === "pendente") return "pendente";
    if (status === "sendo preparado" || status === "pedido feito") return "sendo_preparado";
    if (status === "pronto para entrega" || status === "pronto para retirada") return "pronto_para_entrega";
    return null;
}

function statusAlvoDaColuna(coluna: TColuna, pedido: IPedido): TStatusPedido {
    if (coluna === "pendente") return "pendente";
    if (coluna === "sendo_preparado") return "sendo preparado";
    return pedido.dados_retirada_pedido ? "pronto para retirada" : "pronto para entrega";
}

interface IProps {
    pedidos: IPedido[];
    timezone: string;
    configuracoes: IConfiguracoesPedidos;
    avancandoId: number | null;
    onAbrirDetalhes: (pedidoId: number) => void;
    onAvancar: (pedido: IPedido) => void;
    onMoverStatus: (pedido: IPedido, novoStatus: TStatusPedido) => void;
    onToggleConfig: (chave: "aceite_automatico" | "aceite_automatico_ifood", valor: boolean) => void;
    salvandoConfig: string | null;
}

function CartaoArrastavel({
    pedido,
    timezone,
    avancando,
    onAbrirDetalhes,
    onAvancar,
}: {
    pedido: IPedido;
    timezone: string;
    avancando: boolean;
    onAbrirDetalhes: (id: number) => void;
    onAvancar: (pedido: IPedido) => void;
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: pedido.id });

    return (
        <div ref={setNodeRef} className={`w-full ${isDragging ? "opacity-30" : ""}`}>
            <div
                {...attributes}
                {...listeners}
                className="mb-1 flex cursor-grab items-center justify-center rounded bg-white/20 py-0.5 active:cursor-grabbing"
            >
                <GripVertical className="h-4 w-4 text-white/70" />
            </div>
            <PedidoCard
                pedido={pedido}
                timezone={timezone}
                avancando={avancando}
                onAbrirDetalhes={onAbrirDetalhes}
                onAvancar={onAvancar}
            />
        </div>
    );
}

function ColunaDroppable({
    coluna,
    children,
}: {
    coluna: (typeof COLUNAS)[number];
    children: React.ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: coluna.id });

    return (
        <div
            ref={setNodeRef}
            className={`flex h-[65vh] w-full flex-col items-center gap-3 overflow-y-auto p-2 sm:h-[80vh] sm:gap-4 sm:py-4 ${isOver ? "bg-black/10" : ""}`}
        >
            {children}
        </div>
    );
}

export default function KanbanBoard({
    pedidos,
    timezone,
    configuracoes,
    avancandoId,
    onAbrirDetalhes,
    onAvancar,
    onMoverStatus,
    onToggleConfig,
    salvandoConfig,
}: IProps) {
    const [pedidoArrastando, setPedidoArrastando] = useState<IPedido | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    );

    const grupos = useMemo(() => {
        const base: Record<TColuna, IPedido[]> = { pendente: [], sendo_preparado: [], pronto_para_entrega: [] };
        for (const pedido of pedidos) {
            const coluna = colunaDoPedido(pedido.status);
            if (coluna) base[coluna].push(pedido);
        }
        for (const coluna of Object.keys(base) as TColuna[]) {
            base[coluna].sort((a, b) => (a.prioridade === b.prioridade ? 0 : a.prioridade ? -1 : 1));
        }
        return base;
    }, [pedidos]);

    function handleDragStart(event: DragStartEvent) {
        const pedido = pedidos.find((p) => p.id === event.active.id);
        setPedidoArrastando(pedido ?? null);
    }

    function handleDragEnd(event: DragEndEvent) {
        setPedidoArrastando(null);
        const { active, over } = event;
        if (!over) return;

        const pedido = pedidos.find((p) => p.id === active.id);
        if (!pedido) return;

        const colunaOrigem = colunaDoPedido(pedido.status);
        const colunaDestino = over.id as TColuna;
        if (colunaOrigem === colunaDestino) return;

        onMoverStatus(pedido, statusAlvoDaColuna(colunaDestino, pedido));
    }

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex w-full snap-x snap-mandatory gap-2 overflow-x-auto pb-4 sm:grid sm:snap-none sm:grid-cols-3 sm:gap-0 sm:overflow-x-visible">
                {COLUNAS.map((coluna) => (
                    <div
                        key={coluna.id}
                        className={`min-w-[85vw] flex-shrink-0 snap-center rounded-lg sm:min-w-0 sm:rounded-none ${coluna.corBg}`}
                    >
                        <div className={`sticky top-0 z-10 p-2 ${coluna.corHeader}`}>
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-white sm:text-lg">{coluna.titulo}</p>
                                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white sm:text-sm">
                                    {grupos[coluna.id].length}
                                </span>
                            </div>
                        </div>
                        <ColunaDroppable coluna={coluna}>
                            {coluna.id === "pendente" && (
                                <>
                                    <div className="flex w-full items-center justify-between rounded bg-white/10 p-2">
                                        <p className="text-xs font-bold text-white sm:text-base">Aceitar auto</p>
                                        {salvandoConfig === "aceite_automatico" ? (
                                            <Spinner className="h-4 w-4 text-white" />
                                        ) : (
                                            <Switch
                                                checked={configuracoes.aceite_automatico}
                                                onCheckedChange={(v) => onToggleConfig("aceite_automatico", v)}
                                            />
                                        )}
                                    </div>
                                    <div className="flex w-full items-center justify-between rounded bg-white/10 p-2">
                                        <p className="text-xs font-bold text-white sm:text-base">Aceitar iFood</p>
                                        {salvandoConfig === "aceite_automatico_ifood" ? (
                                            <Spinner className="h-4 w-4 text-white" />
                                        ) : (
                                            <Switch
                                                checked={configuracoes.aceite_automatico_ifood}
                                                onCheckedChange={(v) => onToggleConfig("aceite_automatico_ifood", v)}
                                            />
                                        )}
                                    </div>
                                </>
                            )}
                            {grupos[coluna.id].map((pedido) => (
                                <CartaoArrastavel
                                    key={pedido.id}
                                    pedido={pedido}
                                    timezone={timezone}
                                    avancando={avancandoId === pedido.id}
                                    onAbrirDetalhes={onAbrirDetalhes}
                                    onAvancar={onAvancar}
                                />
                            ))}
                        </ColunaDroppable>
                    </div>
                ))}
            </div>
            <DragOverlay>
                {pedidoArrastando && (
                    <PedidoCard
                        pedido={pedidoArrastando}
                        timezone={timezone}
                        avancando={false}
                        onAbrirDetalhes={() => {}}
                        onAvancar={() => {}}
                    />
                )}
            </DragOverlay>
        </DndContext>
    );
}
