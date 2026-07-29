import { useState } from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, EyeOff, Copy, Pencil, Trash2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface PrecoItemPizza {
    preco: number;
    status: boolean;
}

export interface ItemPizza {
    id: number;
    nome: string; // sabores
    precos_item_pizza: PrecoItemPizza[];
    trashed: boolean;
    external_id: string | null;
}

export interface ItemNormal {
    id: number;
    nome: string;
    descricao?: string | null;
    preco: number;
    desconto?: boolean;
    valor_desconto?: number;
    trashed: boolean;
    external_id: string | null;
}

export type AtualizacaoEmMassa = "codpdv" | "precos" | null;

interface ItensCategoriaTableProps {
    categoriaTipo: "P" | "I";
    categoriaId: number;
    itens: ItemPizza[] | ItemNormal[];
    atualizacaoEmMassa?: AtualizacaoEmMassa;
    onAlterarStatus: (itemId: number) => void;
    onDuplicar: (itemId: number) => void;
    onEditar: (itemId: number, categoriaId: number) => void;
    onRemover: (itemId: number) => void;
    onAtualizaCodPdv: (itemId: number, valor: string) => void;
    onAtualizaPreco: (itemId: number, valor: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function IconButtonComTooltip({
    icon,
    tooltip,
    onClick,
}: {
    icon: React.ReactNode;
    tooltip: string;
    onClick: () => void;
}) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onClick}
                    >
                        {icon}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function AcoesItem({
    item,
    categoriaId,
    onAlterarStatus,
    onDuplicar,
    onEditar,
    onRemover,
}: {
    item: { id: number; trashed: boolean };
    categoriaId: number;
    onAlterarStatus: (itemId: number) => void;
    onDuplicar: (itemId: number) => void;
    onEditar: (itemId: number, categoriaId: number) => void;
    onRemover: (itemId: number) => void;
}) {
    return (
        <div className="flex flex-col gap-2 md:flex-row md:justify-end md:gap-4">
            <IconButtonComTooltip
                icon={
                    item.trashed ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )
                }
                tooltip={item.trashed ? "Inativo" : "Ativo"}
                onClick={() => onAlterarStatus(item.id)}
            />
            <IconButtonComTooltip
                icon={<Copy className="h-4 w-4" />}
                tooltip="Duplicar item"
                onClick={() => onDuplicar(item.id)}
            />
            <IconButtonComTooltip
                icon={<Pencil className="h-4 w-4" />}
                tooltip="Editar item"
                onClick={() => onEditar(item.id, categoriaId)}
            />
            <IconButtonComTooltip
                icon={<Trash2 className="h-4 w-4" />}
                tooltip="Remover item"
                onClick={() => onRemover(item.id)}
            />
        </div>
    );
}

function CelulaCodPdv({
    itemId,
    codpdv,
    editando,
    onAtualizaCodPdv,
}: {
    itemId: number;
    codpdv: string | null;
    editando: boolean;
    onAtualizaCodPdv: (itemId: number, valor: string) => void;
}) {
    if (!editando) {
        return <p>{codpdv}</p>;
    }

    return (
        <Input
            defaultValue={codpdv ?? ""}
            onBlur={(e) => onAtualizaCodPdv(itemId, e.target.value)}
        />
    );
}

// ---------------------------------------------------------------------------
// Tabela de pizzas (categoriaTipo === "P")
// ---------------------------------------------------------------------------

function TabelaPizzas({
    itens,
    categoriaId,
    atualizacaoEmMassa,
    onAlterarStatus,
    onDuplicar,
    onEditar,
    onRemover,
    onAtualizaCodPdv,
}: Omit<ItensCategoriaTableProps, "categoriaTipo" | "itens" | "onAtualizaPreco"> & {
    itens: ItemPizza[];
}) {
    const linhas = itens.map((item) => {
        const itensAtivos = item.precos_item_pizza.filter((p) => p.status);
        return {
            id: item.id,
            sabores: item.nome,
            qtdeTamanhosAtivos: itensAtivos.length,
            menorValor:
                itensAtivos.length > 0
                    ? Math.min(...itensAtivos.map((p) => p.preco))
                    : 0,
            inativo: item.trashed,
            codpdv: item.external_id,
        };
    });

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Sabores</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead className="w-64">Cód. PDV</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {linhas.map((linha) => (
                    <TableRow key={linha.id}>
                        <TableCell>{linha.sabores}</TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <p className="text-xs text-muted-foreground">
                                    Disponível em
                                </p>
                                <strong>
                                    {linha.qtdeTamanhosAtivos}{" "}
                                    {linha.qtdeTamanhosAtivos > 1
                                        ? "tamanhos"
                                        : "tamanho"}
                                </strong>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <p className="text-xs text-muted-foreground">
                                    A partir de
                                </p>
                                <strong>R$ {formatarMoeda(linha.menorValor)}</strong>
                            </div>
                        </TableCell>
                        <TableCell>
                            <CelulaCodPdv
                                itemId={linha.id}
                                codpdv={linha.codpdv}
                                editando={atualizacaoEmMassa === "codpdv"}
                                onAtualizaCodPdv={onAtualizaCodPdv}
                            />
                        </TableCell>
                        <TableCell className="text-right">
                            <AcoesItem
                                item={{ id: linha.id, trashed: linha.inativo }}
                                categoriaId={categoriaId}
                                onAlterarStatus={onAlterarStatus}
                                onDuplicar={onDuplicar}
                                onEditar={onEditar}
                                onRemover={onRemover}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

// ---------------------------------------------------------------------------
// Tabela de itens normais (categoriaTipo === "I")
// ---------------------------------------------------------------------------

function CelulaPreco({
    item,
    editando,
    onAtualizaPreco,
}: {
    item: ItemNormal;
    editando: boolean;
    onAtualizaPreco: (itemId: number, valor: string) => void;
}) {
    const temDesconto = Boolean(item.desconto);

    if (!editando) {
        if (!temDesconto) {
            return <p>R$ {formatarMoeda(item.preco)}</p>;
        }
        return (
            <div className="flex gap-4">
                <p className="italic line-through">
                    R$ {formatarMoeda(item.preco)}
                </p>
                <p>{formatarMoeda(item.valor_desconto ?? 0)}</p>
            </div>
        );
    }

    if (!temDesconto) {
        return (
            <Input
                defaultValue={item.preco}
                onBlur={(e) => onAtualizaPreco(item.id, e.target.value)}
            />
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className="italic line-through text-muted-foreground">
                R$ {formatarMoeda(item.preco)}
            </span>
            <Input
                defaultValue={item.valor_desconto}
                onBlur={(e) => onAtualizaPreco(item.id, e.target.value)}
            />
        </div>
    );
}

function TabelaItensNormais({
    itens,
    categoriaId,
    atualizacaoEmMassa,
    onAlterarStatus,
    onDuplicar,
    onEditar,
    onRemover,
    onAtualizaCodPdv,
    onAtualizaPreco,
}: Omit<ItensCategoriaTableProps, "categoriaTipo" | "itens"> & {
    itens: ItemNormal[];
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="max-w-xs">Item</TableHead>
                    <TableHead className="w-64">Preço</TableHead>
                    <TableHead className="w-64">Cód. PDV</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {itens.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="max-w-xs">
                            <div className="flex flex-col">
                                <p className="font-bold">{item.nome}</p>
                                <p
                                    className="line-clamp-2 text-xs wrap-break-word text-muted-foreground"
                                    title={item.descricao ?? undefined}
                                >
                                    {item.descricao
                                        ? item.descricao
                                        : "Não contém descrição"}
                                </p>
                            </div>
                        </TableCell>
                        <TableCell>
                            <CelulaPreco
                                item={item}
                                editando={atualizacaoEmMassa === "precos"}
                                onAtualizaPreco={onAtualizaPreco}
                            />
                        </TableCell>
                        <TableCell>
                            <CelulaCodPdv
                                itemId={item.id}
                                codpdv={item.external_id}
                                editando={atualizacaoEmMassa === "codpdv"}
                                onAtualizaCodPdv={onAtualizaCodPdv}
                            />
                        </TableCell>
                        <TableCell className="text-right">
                            <AcoesItem
                                item={{ id: item.id, trashed: item.trashed }}
                                categoriaId={categoriaId}
                                onAlterarStatus={onAlterarStatus}
                                onDuplicar={onDuplicar}
                                onEditar={onEditar}
                                onRemover={onRemover}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function ItensCategoriaTable({
    categoriaTipo,
    categoriaId,
    itens,
    atualizacaoEmMassa = null,
    onAlterarStatus,
    onDuplicar,
    onEditar,
    onRemover,
    onAtualizaCodPdv,
    onAtualizaPreco,
}: ItensCategoriaTableProps) {
    if (itens.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                Nenhum item cadastrado nesta categoria.
            </div>
        );
    }

    if (categoriaTipo === "P") {
        return (
            <TabelaPizzas
                itens={itens as ItemPizza[]}
                categoriaId={categoriaId}
                atualizacaoEmMassa={atualizacaoEmMassa}
                onAlterarStatus={onAlterarStatus}
                onDuplicar={onDuplicar}
                onEditar={onEditar}
                onRemover={onRemover}
                onAtualizaCodPdv={onAtualizaCodPdv}
            />
        );
    }

    return (
        <TabelaItensNormais
            itens={itens as ItemNormal[]}
            categoriaId={categoriaId}
            atualizacaoEmMassa={atualizacaoEmMassa}
            onAlterarStatus={onAlterarStatus}
            onDuplicar={onDuplicar}
            onEditar={onEditar}
            onRemover={onRemover}
            onAtualizaCodPdv={onAtualizaCodPdv}
            onAtualizaPreco={onAtualizaPreco}
        />
    );
}

export default ItensCategoriaTable;