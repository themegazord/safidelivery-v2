import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Eye, EyeClosed, Pencil, Trash2 } from "lucide-react";
import { IGrupoComplementoListagem, IPaginacao } from "@/types/empresa/cardapios/types";

interface IProps {
    grupos: IPaginacao<IGrupoComplementoListagem> | null;
    loading: boolean;
    nome: string;
    onFiltrar: (nome: string) => void;
    onMudarPagina: (page: number) => void;
    onAlterarStatus: (grupo: IGrupoComplementoListagem) => void;
    onEditar: (grupo: IGrupoComplementoListagem) => void;
    onRemover: (grupo: IGrupoComplementoListagem) => void;
}

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

export default function ComplementosCardapioTable({
    grupos,
    loading,
    nome,
    onFiltrar,
    onMudarPagina,
    onAlterarStatus,
    onEditar,
    onRemover,
}: IProps) {
    const [busca, setBusca] = useState(nome);
    const primeiraRenderizacao = useRef(true);

    useEffect(() => {
        if (primeiraRenderizacao.current) {
            primeiraRenderizacao.current = false;
            return;
        }

        const temporizador = setTimeout(() => onFiltrar(busca), 400);
        return () => clearTimeout(temporizador);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busca]);

    return (
        <div className="flex flex-col gap-4">
            <div className="max-w-sm">
                <Input
                    placeholder="Buscar por nome do grupo..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Usado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={3} className="py-10 text-center">
                                <Spinner className="mx-auto h-4 w-4" />
                            </TableCell>
                        </TableRow>
                    ) : (grupos?.data.length ?? 0) === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                                Nenhum grupo de complementos cadastrado neste cardápio.
                            </TableCell>
                        </TableRow>
                    ) : (
                        grupos!.data.map((grupo) => (
                            <TableRow key={grupo.id}>
                                <TableCell className="font-medium">{grupo.nome}</TableCell>
                                <TableCell>
                                    {grupo.item_nome ? (
                                        <Badge variant="secondary">{grupo.item_nome}</Badge>
                                    ) : (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <BotaoAcaoComTooltip
                                            icon={grupo.trashed ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            tooltip={grupo.trashed ? "Inativo" : "Ativo"}
                                            onClick={() => onAlterarStatus(grupo)}
                                            variant="outline"
                                        />
                                        <BotaoAcaoComTooltip
                                            icon={<Pencil className="h-4 w-4" />}
                                            tooltip="Editar grupo"
                                            onClick={() => onEditar(grupo)}
                                            variant="outline"
                                        />
                                        <BotaoAcaoComTooltip
                                            icon={<Trash2 className="h-4 w-4" />}
                                            tooltip="Remover grupo"
                                            onClick={() => onRemover(grupo)}
                                            variant="destructive"
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {grupos && grupos.last_page > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        Página {grupos.current_page} de {grupos.last_page} — {grupos.total}{" "}
                        {grupos.total === 1 ? "grupo" : "grupos"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {grupos.links.map((link, index) => (
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
