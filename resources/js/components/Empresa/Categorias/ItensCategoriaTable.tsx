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
import { Spinner } from "@/components/ui/spinner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, EyeOff, Copy, Pencil, Trash2, Plus, EllipsisVertical, SquarePen, Trash } from "lucide-react";
import { ICategoriaStatus } from "@/types/empresa/cardapios/types";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
    categoriasStatus: ICategoriaStatus[]
    status?: boolean,
    itens: ItemPizza[] | ItemNormal[];
    atualizacaoEmMassa?: AtualizacaoEmMassa;
    setStatusCategoria: (categoriaId: number, status: boolean) => void;
    onCriarCombo: (categoriaId: number, status: boolean) => void;
    onCriarItem: (categoriaId: number, status: boolean) => void;
    onCategoriaDuplicar: (categoriaId: number) => void;
    onCategoriaEditar: (categoriaId: number) => void;
    onCategoriaRemover: (categoriaId: number) => void;
    onItensAlterarStatus: (itemId: number) => void;
    onItensDuplicar: (itemId: number) => void;
    onItensEditar: (itemId: number, categoriaId: number, status: boolean) => void;
    onItensRemover: (itemId: number) => void;
    onItensAtualizaCodPdv: (itemId: number, valor: string) => void;
    onItensAtualizaPreco: (itemId: number, valor: string) => void;
    isSubmiting?: boolean;
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
    disabled,
    variant
}: {
    icon: React.ReactNode;
    tooltip: string;
    onClick: () => void;
    disabled?: boolean;
    variant: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link" | null | undefined
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
                            disabled={disabled}
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

function AcoesItem({
    item,
    categoriaId,
    onItensAlterarStatus,
    onItensDuplicar,
    onItensEditar,
    onItensRemover,
    isSubmiting,
}: {
    item: { id: number; trashed: boolean };
    categoriaId: number;
    onItensAlterarStatus: (itemId: number) => void;
    onItensDuplicar: (itemId: number) => void;
    onItensEditar: (itemId: number, categoriaId: number, status: boolean) => void;
    onItensRemover: (itemId: number) => void;
    isSubmiting?: boolean;
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
                onClick={() => onItensAlterarStatus(item.id)}
                variant={'outline'}
            />
            <IconButtonComTooltip
                icon={<Copy className="h-4 w-4" />}
                tooltip="Duplicar item"
                onClick={() => onItensDuplicar(item.id)}
                variant={'outline'}
            />
            <IconButtonComTooltip
                icon={isSubmiting ? <Spinner className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                tooltip="Editar item"
                onClick={() => onItensEditar(item.id, categoriaId, true)}
                disabled={isSubmiting}
                variant={'outline'}
            />
            <IconButtonComTooltip
                icon={<Trash2 className="h-4 w-4" />}
                tooltip="Remover item"
                onClick={() => onItensRemover(item.id)}
                variant={'destructive'}
            />
        </div>
    );
}

function CelulaCodPdv({
    itemId,
    codpdv,
    editando,
    onItensAtualizaCodPdv,
}: {
    itemId: number;
    codpdv: string | null;
    editando: boolean;
    onItensAtualizaCodPdv: (itemId: number, valor: string) => void;
}) {
    if (!editando) {
        return <p>{codpdv}</p>;
    }

    return (
        <Input
            defaultValue={codpdv ?? ""}
            onBlur={(e) => onItensAtualizaCodPdv(itemId, e.target.value)}
        />
    );
}

// ---------------------------------------------------------------------------
// Tabela de pizzas (categoriaTipo === "P")
// ---------------------------------------------------------------------------

type ItensTabelaComunsProps = Pick<
    ItensCategoriaTableProps,
    | "categoriaId"
    | "atualizacaoEmMassa"
    | "onItensAlterarStatus"
    | "onItensDuplicar"
    | "onItensEditar"
    | "onItensRemover"
    | "onItensAtualizaCodPdv"
    | "isSubmiting"
>;

function TabelaPizzas({
    itens,
    categoriaId,
    atualizacaoEmMassa,
    onItensAlterarStatus,
    onItensDuplicar,
    onItensEditar,
    onItensRemover,
    onItensAtualizaCodPdv,
    isSubmiting,
}: ItensTabelaComunsProps & {
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
        <div className="flex flex-col gap-2">
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
                                    onItensAtualizaCodPdv={onItensAtualizaCodPdv}
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                <AcoesItem
                                    item={{ id: linha.id, trashed: linha.inativo }}
                                    categoriaId={categoriaId}
                                    onItensAlterarStatus={onItensAlterarStatus}
                                    onItensDuplicar={onItensDuplicar}
                                    onItensEditar={onItensEditar}
                                    onItensRemover={onItensRemover}
                                    isSubmiting={isSubmiting}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Tabela de itens normais (categoriaTipo === "I")
// ---------------------------------------------------------------------------

function CelulaPreco({
    item,
    editando,
    onItensAtualizaPreco,
}: {
    item: ItemNormal;
    editando: boolean;
    onItensAtualizaPreco: (itemId: number, valor: string) => void;
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
                onBlur={(e) => onItensAtualizaPreco(item.id, e.target.value)}
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
                onBlur={(e) => onItensAtualizaPreco(item.id, e.target.value)}
            />
        </div>
    );
}

function TabelaItensNormais({
    itens,
    categoriaId,
    atualizacaoEmMassa,
    onItensAlterarStatus,
    onItensDuplicar,
    onItensEditar,
    onItensRemover,
    onItensAtualizaCodPdv,
    onItensAtualizaPreco,
    isSubmiting,
}: ItensTabelaComunsProps & {
    itens: ItemNormal[];
    onItensAtualizaPreco: ItensCategoriaTableProps["onItensAtualizaPreco"];
}) {
    return (
        <div className="flex flex-col gap-2">
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
                                    onItensAtualizaPreco={onItensAtualizaPreco}
                                />
                            </TableCell>
                            <TableCell>
                                <CelulaCodPdv
                                    itemId={item.id}
                                    codpdv={item.external_id}
                                    editando={atualizacaoEmMassa === "codpdv"}
                                    onItensAtualizaCodPdv={onItensAtualizaCodPdv}
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                <AcoesItem
                                    item={{ id: item.id, trashed: item.trashed }}
                                    categoriaId={categoriaId}
                                    onItensAlterarStatus={onItensAlterarStatus}
                                    onItensDuplicar={onItensDuplicar}
                                    onItensEditar={onItensEditar}
                                    onItensRemover={onItensRemover}
                                    isSubmiting={isSubmiting}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function ItensCategoriaTable({
    categoriaTipo,
    categoriaId,
    categoriasStatus,
    setStatusCategoria,
    status,
    itens,
    atualizacaoEmMassa = null,
    onCriarCombo,
    onCriarItem,
    onCategoriaDuplicar,
    onCategoriaEditar,
    onCategoriaRemover,
    onItensAlterarStatus,
    onItensDuplicar,
    onItensEditar,
    onItensRemover,
    onItensAtualizaCodPdv,
    onItensAtualizaPreco,
    isSubmiting,
}: ItensCategoriaTableProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 w-full">
                <Field orientation={"horizontal"}>
                    <Checkbox checked={status} onCheckedChange={(checked) => setStatusCategoria(categoriaId, checked as boolean)} />
                    <FieldLabel>Inativo?</FieldLabel>
                </Field>
                <div className="flex flex-row gap-4">
                    <Button onClick={() => onCriarCombo(categoriaId, true)}>{<Plus />}Adicionar combo</Button>
                    <Button onClick={() => onCriarItem(categoriaId, true)}>{<Plus />}Adicionar item</Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant={"ghost"} />}>
                            <EllipsisVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Opções</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onCategoriaDuplicar(categoriaId)}><Copy /> Duplicar</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onCategoriaEditar(categoriaId)}><SquarePen /> Editar</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onCategoriaRemover(categoriaId)} variant="destructive"><Trash /> Remover</DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            {itens.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                    Nenhum item cadastrado nesta categoria.
                </div>
            ) : categoriaTipo === "P" ? (
                <TabelaPizzas
                    itens={itens as ItemPizza[]}
                    categoriaId={categoriaId}
                    atualizacaoEmMassa={atualizacaoEmMassa}
                    onItensAlterarStatus={onItensAlterarStatus}
                    onItensDuplicar={onItensDuplicar}
                    onItensEditar={onItensEditar}
                    onItensRemover={onItensRemover}
                    onItensAtualizaCodPdv={onItensAtualizaCodPdv}
                    isSubmiting={isSubmiting}
                />
            ) : (
                <TabelaItensNormais
                    itens={itens as ItemNormal[]}
                    categoriaId={categoriaId}
                    atualizacaoEmMassa={atualizacaoEmMassa}
                    onItensAlterarStatus={onItensAlterarStatus}
                    onItensDuplicar={onItensDuplicar}
                    onItensEditar={onItensEditar}
                    onItensRemover={onItensRemover}
                    isSubmiting={isSubmiting}
                    onItensAtualizaCodPdv={onItensAtualizaCodPdv}
                    onItensAtualizaPreco={onItensAtualizaPreco}
                />
            )}
        </div>
    )
}

export default ItensCategoriaTable;
