import GerenciarOrdenacaoDialog from "@/components/Empresa/Categorias/GerenciarOrdenacaoDialog";
import ItensCategoriaTable, {
    ItemNormal,
    ItemPizza,
} from "@/components/Empresa/Categorias/ItensCategoriaTable";
import ItensCategoriaTableSkeleton from "@/components/Empresa/Categorias/ItensCategoriaTableSkeleton";
import UpsertCategoriaDrawer from "@/components/Empresa/Categorias/UpsertCategoriaDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import { ICategoria, ICategoriaStatus } from "@/types/empresa/cardapios/types";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { ArrowUpDown, ChevronDown, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Categoria() {
    const { categorias, cnpj, cardapio_id, categoriaStatus } = usePage<{
        categorias: ICategoria[];
        categoriaStatus: ICategoriaStatus[];
        cardapio_id: string;
        cnpj: string;
    }>().props;
    const [itensPorCategoria, setItensPorCategoria] = useState<
        Record<number, ItemNormal[] | ItemPizza[]>
    >({});
    const [loadingCategoria, setLoadingCategoria] = useState<number | null>(
        null,
    );
    const [
        handleDialogGerenciarOrdernacao,
        setHandleDialogGerenciarOrdernacao,
    ] = useState(false);
    const [handleDrawerUpsertCategoria, setHandleDrawerUpsertCategoria] = useState(false)
    const [modeUpsertCategoria, setModeUpsertCategoria] = useState<'create' | 'update' | undefined>(undefined)
    const [categoriasState, setCategoriasState] = useState<ICategoria[]>();
    const TABS_INFO = [
        { value: "categorias", label: "Categorias" },
        { value: "produtos", label: "Produtos" },
        { value: "complementos", label: "Complementos" },
    ] as const;
    const HEADER_FUNCTIONS = [
        {
            label: "Cadastra categoria",
            icon: <Plus />,
            action: () => abreCadastroCategoria('create'),
            type: "button",
        },
        {
            label: "Ordenação",
            icon: <ArrowUpDown />,
            action: () => setHandleDialogGerenciarOrdernacao(true),
            type: "button",
        },
        {
            label: "Att. em massa",
            icon: <ChevronDown />,
            action: () => {},
            type: "dropdown-menu",
        },
    ] as const;
    const ATT_MASSA_OPTIONS = [
        { label: "Padrão", action: () => {} },
        { label: "Preços", action: () => {} },
        { label: "Cód. PDV", action: () => {} },
    ] as const;

    useEffect(() => {
        setCategoriasState(categorias);
    }, []);

    const handleOpenChange = async (categoriaId: number, open: boolean) => {
        if (open && !itensPorCategoria[categoriaId]) {
            console.log({ cnpj, cardapio_id, categoria_id: categoriaId });
            setLoadingCategoria(categoriaId);
            await axios
                .get(
                    route(
                        "aplicacao.empresa.cardapios.categorias.itens.itens_por_categoria",
                        { cnpj, cardapio_id, categoria_id: categoriaId },
                    ),
                )
                .then((response) => {
                    setItensPorCategoria((prev) => ({
                        ...prev,
                        [categoriaId]: response.data,
                    }));
                    setLoadingCategoria(null);
                });
        }
    };

    async function ordernarCategorias(categoriasOrdenadas: ICategoria[]) {
        setCategoriasState(categoriasOrdenadas);
        await axios
            .post(
                route("aplicacao.empresa.cardapios.categorias.reordenar", {
                    cnpj,
                    cardapio_id,
                }),
                {
                    ordem: categoriasOrdenadas.map((c, idx) => ({
                        id: c.id,
                        ordem: idx + 1,
                    })),
                },
            )
            .catch((error) =>
                toast.error(
                    error.response.data.message ??
                        "Erro ao ordenar as categorias",
                ),
            );
    }

    function abreCadastroCategoria(mode: 'create' | 'update') {
        if (mode === 'create') {
            setHandleDrawerUpsertCategoria(true)
            setModeUpsertCategoria(mode)
        }
    }

    return (
        <LayoutAutenticado>
            <Card>
                <CardHeader>
                    <CardTitle>Categorias</CardTitle>
                    <CardDescription>
                        Aqui você vai poder cadastrar os itens que seus clientes
                        acessaram quando esse cardápio estiver operante!
                        Personalize e organize suas categorias de produtos no
                        Safi Delivery para criar experiências que conquistam.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col">
                    <Tabs defaultValue="categorias">
                        <TabsList>
                            {TABS_INFO.map((ti) => (
                                <TabsTrigger value={ti.value} key={ti.value}>
                                    {ti.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <TabsContent
                            value="categorias"
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col-reverse gap-4 md:flex md:flex-row-reverse">
                                {HEADER_FUNCTIONS.map((hf, hfIdx) => {
                                    if (hf.type === "button") {
                                        return (
                                            <Button
                                                onClick={hf.action}
                                                key={hfIdx}
                                            >
                                                {hf.icon}
                                                {hf.label}
                                            </Button>
                                        );
                                    }

                                    if (hf.type === "dropdown-menu") {
                                        return (
                                            <DropdownMenu key={hfIdx}>
                                                <DropdownMenuTrigger render={<Button variant="outline" />}>
                                                    {hf.icon}
                                                    {hf.label}
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuLabel>
                                                            Opções
                                                        </DropdownMenuLabel>
                                                        {ATT_MASSA_OPTIONS.map(
                                                            (amo, amoIdx) => (
                                                                <DropdownMenuItem
                                                                    onClick={
                                                                        amo.action
                                                                    }
                                                                    key={amoIdx}
                                                                >
                                                                    {amo.label}
                                                                </DropdownMenuItem>
                                                            ),
                                                        )}
                                                    </DropdownMenuGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        );
                                    }
                                })}
                            </div>
                            <div className="flex flex-col gap-4">
                                {(categoriasState ?? []).map((categoria, _) => (
                                    <Collapsible
                                        key={categoria.id}
                                        onOpenChange={(open) =>
                                            handleOpenChange(categoria.id, open)
                                        }
                                        className="rounded-md border"
                                    >
                                        <CollapsibleTrigger className="group bg-muted text-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between gap-2 rounded-md px-4 py-2 text-left text-sm font-medium">
                                            <span className="flex gap-4">
                                                {categoria.nome}
                                                <Badge>
                                                    {categoria.itens_count ?? 0}{" "}
                                                    itens
                                                </Badge>
                                            </span>
                                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="text-muted-foreground px-4 py-2 text-sm">
                                            {loadingCategoria ===
                                            categoria.id ? (
                                                <ItensCategoriaTableSkeleton
                                                    categoriaTipo={
                                                        categoria.tipo as
                                                            "I" | "P"
                                                    }
                                                    linhas={3}
                                                />
                                            ) : (
                                                <ItensCategoriaTable
                                                    categoriaTipo={
                                                        categoria.tipo as
                                                            "I" | "P"
                                                    }
                                                    categoriaId={categoria.id}
                                                    itens={
                                                        itensPorCategoria[
                                                            categoria.id
                                                        ] ?? []
                                                    }
                                                    atualizacaoEmMassa={
                                                        undefined
                                                    }
                                                    categoriasStatus={
                                                        categoriaStatus
                                                    }
                                                    setStatusCategoria={() => {}}
                                                    onCriarCombo={() => {}}
                                                    onCriarItem={() => {}}
                                                    onCategoriaDuplicar={() => {}}
                                                    onCategoriaEditar={() => {}}
                                                    onCategoriaRemover={() => {}}
                                                    onItensAlterarStatus={() => {}}
                                                    onItensDuplicar={() => {}}
                                                    onItensEditar={() => {}}
                                                    onItensRemover={() => {}}
                                                    onItensAtualizaCodPdv={() => {}}
                                                    onItensAtualizaPreco={() => {}}
                                                />
                                            )}
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="produtos"></TabsContent>
                        <TabsContent value="complementos"></TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
            <GerenciarOrdenacaoDialog
                open={handleDialogGerenciarOrdernacao}
                onOpenChange={setHandleDialogGerenciarOrdernacao}
                categorias={categorias}
                onOrdenar={ordernarCategorias}
            />
            <UpsertCategoriaDrawer open={handleDrawerUpsertCategoria} onOpenChange={setHandleDrawerUpsertCategoria} mode={modeUpsertCategoria} />
        </LayoutAutenticado>
    );
}
