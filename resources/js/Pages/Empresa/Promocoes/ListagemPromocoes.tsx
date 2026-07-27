import { useEffect, useRef, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
import {
    BarChart3,
    CheckCircle2,
    Eye,
    Link as LinkIcon,
    Percent,
    Plus,
    RotateCcw,
    SquarePen,
    Ticket,
    Trash2,
    Truck,
    XCircle,
    ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import ModalCompartilharLink from "@/components/Empresa/Promocoes/Modais/ModalCompartilharLink";
import ModalDetalhesCupom from "@/components/Empresa/Promocoes/Modais/ModalDetalhesCupom";
import ModalRemoverCupom from "@/components/Empresa/Promocoes/Modais/ModalRemoverCupom";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import {
    IEstatisticasPromocoes,
    IFiltrosPromocoes,
    IPaginacao,
    IPromocao,
} from "@/types/empresa/promocoes/types";

type ListagemPromocoesProps = {
    cupons: IPaginacao<IPromocao>;
    filtros: IFiltrosPromocoes;
    estatisticas: IEstatisticasPromocoes;
    interacaoId: string;
};

function formataMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export default function ListagemPromocoes({
    cupons,
    filtros,
    estatisticas,
    interacaoId,
}: ListagemPromocoesProps) {
    const { cnpj } = usePage<{ cnpj: string }>().props;
    const [busca, setBusca] = useState(filtros.nome_cupom ?? "");
    const primeiraRenderizacao = useRef(true);

    const [cupomLink, setCupomLink] = useState<IPromocao | null>(null);
    const [cupomRemocao, setCupomRemocao] = useState<IPromocao | null>(null);
    const [cupomDetalhes, setCupomDetalhes] = useState<IPromocao | null>(
        null,
    );
    const [removendo, setRemovendo] = useState(false);

    function aplicarFiltros(novosFiltros: Partial<IFiltrosPromocoes>) {
        router.get(
            route("aplicacao.empresa.promocoes.index", { cnpj }),
            { ...filtros, ...novosFiltros },
            { preserveState: true, replace: true },
        );
    }

    useEffect(() => {
        if (primeiraRenderizacao.current) {
            primeiraRenderizacao.current = false;
            return;
        }

        const temporizador = setTimeout(() => {
            aplicarFiltros({ nome_cupom: busca });
        }, 400);

        return () => clearTimeout(temporizador);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busca]);

    function limparFiltros() {
        setBusca("");
        router.get(
            route("aplicacao.empresa.promocoes.index", { cnpj }),
            {},
            { preserveState: true, replace: true },
        );
    }

    const temFiltrosAtivos = Object.values(filtros).some(
        (valor) => valor !== undefined && valor !== "",
    );

    async function removerCupom() {
        if (!cupomRemocao) {
            return;
        }

        setRemovendo(true);

        await axios
            .delete(
                route("aplicacao.empresa.promocoes.destroy", {
                    cnpj,
                    cupom_id: btoa(String(cupomRemocao.id)),
                }),
            )
            .then((response) => {
                toast.success(response.data.mensagem);
                setCupomRemocao(null);
                router.reload({ only: ["cupons", "estatisticas"] });
            })
            .catch((error) => {
                toast.error(
                    error.response?.data?.message ??
                        "Não foi possível remover o cupom",
                );
            })
            .finally(() => setRemovendo(false));
    }

    function urlEdicao(cupom: IPromocao) {
        const url = route("aplicacao.empresa.promocoes.edicao", {
            cnpj,
            cupom_id: btoa(String(cupom.id)),
        });
        console.log("DEBUG urlEdicao", {
            cupomId: cupom.id,
            cnpj,
            base64: btoa(String(cupom.id)),
            url,
        });
        return url;
    }

    return (
        <LayoutAutenticado>
            <div className="w-full px-4 py-6 lg:px-8 lg:py-8">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-primary p-3 shadow-lg">
                            <Ticket className="size-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Cupons de Desconto
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Gerencie cupons e acompanhe o desempenho
                            </p>
                        </div>
                    </div>
                    <Link href={route("aplicacao.empresa.promocoes.cadastro", { cnpj })}>
                        <Button>
                            <Plus /> Novo Cupom
                        </Button>
                    </Link>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Total de Cupons
                                </p>
                                <p className="mt-1 text-2xl font-bold text-foreground">
                                    {estatisticas.total}
                                </p>
                            </div>
                            <div className="rounded-lg bg-blue-500/10 p-3">
                                <Ticket className="size-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Ativos
                                </p>
                                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                                    {estatisticas.ativos}
                                </p>
                            </div>
                            <div className="rounded-lg bg-green-500/10 p-3">
                                <CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Expirados
                                </p>
                                <p className="mt-1 text-2xl font-bold text-destructive">
                                    {estatisticas.expirados}
                                </p>
                            </div>
                            <XCircle className="size-6 text-destructive" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Total de Usos
                                </p>
                                <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {estatisticas.total_usos}
                                </p>
                            </div>
                            <div className="rounded-lg bg-purple-500/10 p-3">
                                <BarChart3 className="size-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mb-6">
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        <Select
                            value={filtros.tipo_cupom || "todos"}
                            onValueChange={(value) =>
                                aplicarFiltros({
                                    tipo_cupom:
                                        value === "todos"
                                            ? ""
                                            : (value as IFiltrosPromocoes["tipo_cupom"]),
                                })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Tipo de desconto" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos os tipos</SelectItem>
                                <SelectItem value="reais">Reais (R$)</SelectItem>
                                <SelectItem value="porcentagem">Porcentagem (%)</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filtros.onde_afetara || "todos"}
                            onValueChange={(value) =>
                                aplicarFiltros({
                                    onde_afetara:
                                        value === "todos"
                                            ? ""
                                            : (value as IFiltrosPromocoes["onde_afetara"]),
                                })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Aplicar em" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="produto">Produtos</SelectItem>
                                <SelectItem value="frete">Frete</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filtros.validade || "todos"}
                            onValueChange={(value) =>
                                aplicarFiltros({
                                    validade:
                                        value === "todos"
                                            ? ""
                                            : (value as IFiltrosPromocoes["validade"]),
                                })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Validade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="<">Expirados</SelectItem>
                                <SelectItem value=">=">Válidos</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filtros.status || "todos"}
                            onValueChange={(value) =>
                                aplicarFiltros({
                                    status:
                                        value === "todos"
                                            ? ""
                                            : (value as IFiltrosPromocoes["status"]),
                                })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="1">Ativos</SelectItem>
                                <SelectItem value="0">Inativos</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input
                            placeholder="Buscar cupom..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </CardContent>
                    {temFiltrosAtivos && (
                        <CardContent className="border-t border-border pt-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={limparFiltros}
                            >
                                <RotateCcw /> Limpar Filtros
                            </Button>
                        </CardContent>
                    )}
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cupom</TableHead>
                                    <TableHead>Usos</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Desconto</TableHead>
                                    <TableHead>Aplicado em</TableHead>
                                    <TableHead>Pedido mínimo</TableHead>
                                    <TableHead>Validade</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Ações
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cupons.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            Nenhum cupom encontrado
                                        </TableCell>
                                    </TableRow>
                                )}
                                {cupons.data.map((cupom) => {
                                    const expirado =
                                        cupom.data_vencimento <
                                        new Date().toISOString().slice(0, 10);
                                    const bloqueado =
                                        cupom.pedidos_que_foram_usados_cupom_count >
                                        0;

                                    return (
                                        <TableRow key={cupom.id}>
                                            <TableCell>
                                                <span className="rounded bg-primary/10 px-2 py-1 font-mono font-semibold text-primary">
                                                    {cupom.nome_cupom}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {
                                                        cupom.pedidos_que_foram_usados_cupom_count
                                                    }{" "}
                                                    / {cupom.qtde_usos}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {cupom.tipo_cupom ===
                                                "porcentagem" ? (
                                                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                        <Percent className="size-4" />
                                                        Porcentagem
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                        R$ Reais
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={
                                                        cupom.tipo_cupom ===
                                                        "porcentagem"
                                                            ? "text-lg font-bold text-blue-600 dark:text-blue-400"
                                                            : "text-lg font-bold text-green-600 dark:text-green-400"
                                                    }
                                                >
                                                    {cupom.tipo_cupom ===
                                                    "porcentagem"
                                                        ? `${cupom.valor_desconto}%`
                                                        : `R$ ${formataMoeda(cupom.valor_desconto)}`}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {cupom.onde_afetara ===
                                                "produto" ? (
                                                    <Badge className="gap-1">
                                                        <ShoppingBag className="size-3" />
                                                        Produtos
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="gap-1"
                                                    >
                                                        <Truck className="size-3" />
                                                        Frete
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                R${" "}
                                                {formataMoeda(
                                                    cupom.valor_minimo_pedido,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {expirado ? (
                                                    <Badge
                                                        variant="destructive"
                                                        className="gap-1"
                                                    >
                                                        <XCircle className="size-3" />
                                                        Expirado
                                                    </Badge>
                                                ) : (
                                                    <Badge className="gap-1 bg-green-600 text-white">
                                                        <CheckCircle2 className="size-3" />
                                                        Válido
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {cupom.status ? (
                                                    <Badge className="bg-green-600 text-white">
                                                        Ativo
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">
                                                        Inativo
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        title="Ver detalhes"
                                                        onClick={() =>
                                                            setCupomDetalhes(
                                                                cupom,
                                                            )
                                                        }
                                                    >
                                                        <Eye />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        title="Compartilhar link"
                                                        onClick={() =>
                                                            setCupomLink(
                                                                cupom,
                                                            )
                                                        }
                                                    >
                                                        <LinkIcon />
                                                    </Button>
                                                    <Link
                                                        href={urlEdicao(cupom)}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            title="Editar"
                                                            disabled={
                                                                bloqueado
                                                            }
                                                        >
                                                            <SquarePen />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        title="Excluir"
                                                        disabled={bloqueado}
                                                        onClick={() =>
                                                            setCupomRemocao(
                                                                cupom,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {cupons.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Página {cupons.current_page} de{" "}
                            {cupons.last_page} — {cupons.total} cupons
                        </p>
                        <div className="flex gap-2">
                            {cupons.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url &&
                                        router.get(
                                            link.url,
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ModalCompartilharLink
                aberto={!!cupomLink}
                onOpenChange={(aberto) => !aberto && setCupomLink(null)}
                cupom={cupomLink}
                interacaoId={interacaoId}
            />

            <ModalRemoverCupom
                aberto={!!cupomRemocao}
                onOpenChange={(aberto) => !aberto && setCupomRemocao(null)}
                cupom={cupomRemocao}
                onConfirmar={removerCupom}
                removendo={removendo}
            />

            <ModalDetalhesCupom
                aberto={!!cupomDetalhes}
                onOpenChange={(aberto) => !aberto && setCupomDetalhes(null)}
                cupom={cupomDetalhes}
                podeEditar={
                    !cupomDetalhes ||
                    cupomDetalhes.pedidos_que_foram_usados_cupom_count === 0
                }
                onEditar={() => {
                    if (cupomDetalhes) {
                        router.visit(urlEdicao(cupomDetalhes));
                    }
                }}
            />
        </LayoutAutenticado>
    );
}
