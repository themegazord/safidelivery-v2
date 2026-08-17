import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, EyeClosed, Plus, Trash2 } from "lucide-react";
import { IPaginacao, IProduto } from "@/types/empresa/cardapios/types";

export interface IFiltrosProdutos {
    status: "" | "ativo" | "inativo";
    ordenacao: "asc" | "desc";
    nome: string;
}

interface IProps {
    produtos: IPaginacao<IProduto> | null;
    loading: boolean;
    filtros: IFiltrosProdutos;
    onFiltrar: (novosFiltros: Partial<IFiltrosProdutos>) => void;
    onMudarPagina: (page: number) => void;
    onAdicionarItem: () => void;
    onAlterarStatus: (itemId: number, categoriaId: number) => void;
    onRemover: (produto: { id: number; categoria_id: number; nome: string }) => void;
    onTrocarImagem: (itemId: number, categoriaId: number, arquivo: File) => Promise<void>;
}

const TAG_POR_TIPO: Record<string, string> = {
    PRE: "Item principal",
    IND: "Item principal",
    BEB: "Item principal",
    PIZ: "Pizza",
    CON: "Combo",
};

const STATUS_ITEMS: Record<string, string> = {
    todos: "Todos",
    ativo: "Ativos",
    inativo: "Inativos",
};

const ORDENACAO_ITEMS: Record<string, string> = {
    asc: "Nome (A-Z)",
    desc: "Nome (Z-A)",
};

function BotaoAcaoComTooltip({
    icon,
    tooltip,
    onClick,
    variant,
}: {
    icon: React.ReactNode;
    tooltip: string;
    onClick: () => void;
    variant: "outline" | "destructive";
}) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button
                            type="button"
                            variant={variant}
                            size="icon"
                            className="h-8 w-8"
                            onClick={onClick}
                        />
                    }
                >
                    {icon}
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function CelulaImagemProduto({
    imagem,
    onTrocarImagem,
}: {
    imagem: string | null;
    onTrocarImagem: (arquivo: File) => Promise<void>;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [enviando, setEnviando] = useState(false);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const arquivo = e.target.files?.[0];
        e.target.value = "";
        if (!arquivo) return;
        setEnviando(true);
        await onTrocarImagem(arquivo).finally(() => setEnviando(false));
    }

    return (
        <>
            <button
                type="button"
                className="flex items-center justify-center overflow-hidden rounded-md border border-input bg-muted"
                style={{ width: 60, height: 48 }}
                onClick={() => inputRef.current?.click()}
                disabled={enviando}
            >
                {enviando ? (
                    <Spinner className="h-4 w-4" />
                ) : (
                    <img
                        src={imagem ?? "https://placehold.co/60x48"}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                )}
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
        </>
    );
}

export default function ProdutosCardapioTable({
    produtos,
    loading,
    filtros,
    onFiltrar,
    onMudarPagina,
    onAdicionarItem,
    onAlterarStatus,
    onRemover,
    onTrocarImagem,
}: IProps) {
    const [busca, setBusca] = useState(filtros.nome);
    const primeiraRenderizacao = useRef(true);

    useEffect(() => {
        if (primeiraRenderizacao.current) {
            primeiraRenderizacao.current = false;
            return;
        }

        const temporizador = setTimeout(() => onFiltrar({ nome: busca }), 400);
        return () => clearTimeout(temporizador);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busca]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col-reverse gap-4 md:flex md:flex-row md:items-center md:justify-between">
                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
                    <Select
                        items={STATUS_ITEMS}
                        value={filtros.status || "todos"}
                        onValueChange={(value) =>
                            onFiltrar({
                                status: value === "todos" ? "" : (value as IFiltrosProdutos["status"]),
                            })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="ativo">Ativos</SelectItem>
                            <SelectItem value="inativo">Inativos</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        items={ORDENACAO_ITEMS}
                        value={filtros.ordenacao}
                        onValueChange={(value) =>
                            onFiltrar({ ordenacao: value as IFiltrosProdutos["ordenacao"] })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Ordenar por nome" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">Nome (A-Z)</SelectItem>
                            <SelectItem value="desc">Nome (Z-A)</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Buscar por nome..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
                <Button onClick={onAdicionarItem}>
                    <Plus /> Adicionar item
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Imagem</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Classificação</TableHead>
                        <TableHead>Disponível em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="py-10 text-center">
                                <Spinner className="mx-auto h-4 w-4" />
                            </TableCell>
                        </TableRow>
                    ) : (produtos?.data.length ?? 0) === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                                Nenhum item cadastrado neste cardápio.
                            </TableCell>
                        </TableRow>
                    ) : (
                        produtos!.data.map((produto) => (
                            <TableRow key={produto.id}>
                                <TableCell>
                                    <CelulaImagemProduto
                                        imagem={produto.imagem}
                                        onTrocarImagem={(arquivo) => onTrocarImagem(produto.id, produto.categoria_id, arquivo)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{produto.nome}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {TAG_POR_TIPO[produto.tipo] ?? produto.tipo}
                                    </Badge>
                                </TableCell>
                                <TableCell>{produto.categoria_nome ?? "—"}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <BotaoAcaoComTooltip
                                            icon={produto.trashed ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            tooltip={produto.trashed ? "Inativo" : "Ativo"}
                                            onClick={() => onAlterarStatus(produto.id, produto.categoria_id)}
                                            variant="outline"
                                        />
                                        <BotaoAcaoComTooltip
                                            icon={<Trash2 className="h-4 w-4" />}
                                            tooltip="Remover item"
                                            onClick={() =>
                                                onRemover({
                                                    id: produto.id,
                                                    categoria_id: produto.categoria_id,
                                                    nome: produto.nome,
                                                })
                                            }
                                            variant="destructive"
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {produtos && produtos.last_page > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        Página {produtos.current_page} de {produtos.last_page} — {produtos.total}{" "}
                        {produtos.total === 1 ? "item" : "itens"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {produtos.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => {
                                    const pagina = link.url
                                        ? new URL(link.url).searchParams.get("page")
                                        : null;
                                    if (pagina) onMudarPagina(Number(pagina));
                                }}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
