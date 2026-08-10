import ConfirmarClonagemCategoriaDialog from "@/components/Empresa/Categorias/ConfirmarClonagemCategoriaDialog";
import ConfirmarRemocaoCategoriaDialog from "@/components/Empresa/Categorias/ConfirmarRemocaoCategoriaDialog";
import ConfirmarClonagemItemDialog from "@/components/Empresa/Itens/ConfirmarClonagemItemDialog";
import ConfirmarRemocaoItemDialog from "@/components/Empresa/Itens/ConfirmarRemocaoItemDialog";
import GerenciarOrdenacaoDialog from "@/components/Empresa/Categorias/GerenciarOrdenacaoDialog";
import ItensCategoriaTable, {
    ItemNormal,
    ItemPizza,
} from "@/components/Empresa/Categorias/ItensCategoriaTable";
import ItensCategoriaTableSkeleton from "@/components/Empresa/Categorias/ItensCategoriaTableSkeleton";
import UpsertCategoriaDrawer, { CategoriaFormData } from "@/components/Empresa/Categorias/UpsertCategoriaDrawer";
import UpsertItemDrawer, { TItem } from "@/components/Empresa/Itens/UpsertItemDrawer";
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
import { ICategoria, ICategoriaStatus, ICategoriaTamanho } from "@/types/empresa/cardapios/types";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { ArrowUpDown, ChevronDown, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Garante um card por tamanho da categoria, mesmo que o tamanho nunca tenha
// sido marcado como ativo (e por isso não tenha ItemPreco salvo no backend).
function mesclarPrecosComTamanhos(
    tamanhos: ICategoriaTamanho[],
    precosExistentes?: TItem["precos"],
): TItem["precos"] {
    return tamanhos.map((tamanho) => {
        const precoExistente = precosExistentes?.find(
            (preco) => preco.tamanho_id === tamanho.id,
        )
        return precoExistente ?? {
            tamanho_id: tamanho.id,
            tamanho: tamanho.nome,
            status: false,
            preco: undefined,
            dias_funcionamento: [],
        }
    })
}

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
    const [handleDrawerUpsertItem, setHandleDrawerUpsertItem] = useState(false)
    const [handleDialogClonagemCategoria, setHandleDialogClonagemCategoria] = useState(false)
    const [handleDialogRemocaoCategoria, setHandleDialogRemocaoCategoria] = useState(false)
    const [handleDialogClonagemItem, setHandleDialogClonagemItem] = useState(false)
    const [handleDialogRemocaoItem, setHandleDialogRemocaoItem] = useState(false)
    const [loadingClonagemCategoria, setLoadingClonagemCategoria] = useState(false)
    const [loadingRemocaoCategoria, setLoadingRemocaoCategoria] = useState(false)
    const [loadingClonagemItem, setLoadingClonagemItem] = useState(false)
    const [loadingRemocaoItem, setLoadingRemocaoItem] = useState(false)
    const [isSubmiting, setIsSubmiting] = useState<boolean>(false)
    const [carregandoItem, setCarregandoItem] = useState<boolean>(false)
    const [categoriasState, setCategoriasState] = useState<ICategoria[]>();
    const [categoria, setCategoria] = useState<
        (Partial<CategoriaFormData> & { id: number }) | undefined
    >()
    const [item, setItem] = useState<(Partial<TItem> & {id?: number}) | undefined>()
    const [itemParaClonar, setItemParaClonar] = useState<{ id: number; categoria_id: number; nome?: string } | undefined>()
    const [itemParaRemover, setItemParaRemover] = useState<{ id: number; categoria_id: number; nome?: string } | undefined>()
    const TABS_INFO = [
        { value: "categorias", label: "Categorias" },
        { value: "produtos", label: "Produtos" },
        { value: "complementos", label: "Complementos" },
    ] as const;
    const HEADER_FUNCTIONS = [
        {
            label: "Cadastra categoria",
            icon: <Plus />,
            action: () => abreCadastroCategoria(),
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
    const QTD_SABORES = [
        { id: 1, nome: 1 },
        { id: 2, nome: 2 },
        { id: 3, nome: 3 },
        { id: 4, nome: 4 },
    ];
    const DIAS_SEMANA = [
        { id: 0, nome: "Domingo" },
        { id: 1, nome: "Segunda-feira" },
        { id: 2, nome: "Terça-feira" },
        { id: 3, nome: "Quarta-feira" },
        { id: 4, nome: "Quinta-feira" },
        { id: 5, nome: "Sexta-feira" },
        { id: 6, nome: "Sábado" },
    ];

    useEffect(() => {
        setCategoriasState(categorias);
    }, [categorias]);

    async function carregarItensDaCategoria(categoriaId: number) {
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
            })
            .finally(() => setLoadingCategoria(null));
    }

    const handleOpenChange = async (categoriaId: number, open: boolean) => {
        if (open && !itensPorCategoria[categoriaId]) {
            await carregarItensDaCategoria(categoriaId);
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
                    error.response?.data?.message ??
                        "Erro ao ordenar as categorias",
                ),
            );
    }
    // Funções de manipulação do drawer item
    function abreCadastroCategoria() {
        setHandleDrawerUpsertCategoria(true)
        setCategoria(undefined)
    }

    async function abreDialogConfirmacaoClonagemCategoria(categoria_id: number) {
        setCategoriaAtual(categoria_id)
        setHandleDialogClonagemCategoria(true)
    }

    async function abreEdicaoCategoria(categoria_id: number) {
        await setCategoriaAtual(categoria_id)
        setHandleDrawerUpsertCategoria(true)
    }

    async function abreRemocaoCategoria(categoria_id: number) {
        setCategoriaAtual(categoria_id)
        setHandleDialogRemocaoCategoria(true)
    }
    // Funções de manipulação do drawer item
    function abreCadastroItem(categoria_id: number, status: boolean) {
        const categoriaSelecionada = categoriasState?.find((c) => c.id === categoria_id)
        const categoriaTipo = categoriaSelecionada?.tipo as 'I' | 'P'
        setItem({
            categoria_id,
            categoria_tipo: categoriaTipo,
            ...(categoriaTipo === 'P' ? {
                tipo: 'PIZ' as const,
                precos: mesclarPrecosComTamanhos(categoriaSelecionada?.tamanhos ?? []),
            } : {}),
        })
        setHandleDrawerUpsertItem(status)
    }

    async function abreEdicaoItem(item_id: number, categoria_id: number, status: boolean) {
        await consultaItem(categoria_id, item_id, () => setHandleDrawerUpsertItem(status))
    }

    function abreDialogConfirmacaoClonagemItem(item_id: number, categoria_id: number) {
        const itemEncontrado = itensPorCategoria[categoria_id]?.find((i) => i.id === item_id)
        setItemParaClonar({ id: item_id, categoria_id, nome: (itemEncontrado as ItemNormal | ItemPizza | undefined)?.nome })
        setHandleDialogClonagemItem(true)
    }

    function abreDialogConfirmacaoRemocaoItem(item_id: number, categoria_id: number) {
        const itemEncontrado = itensPorCategoria[categoria_id]?.find((i) => i.id === item_id)
        setItemParaRemover({ id: item_id, categoria_id, nome: (itemEncontrado as ItemNormal | ItemPizza | undefined)?.nome })
        setHandleDialogRemocaoItem(true)
    }
    // Funções CRUD categoria
    async function cadastrarCategoria(categoriaDigitada: CategoriaFormData) {
        await axios.post(route('aplicacao.empresa.cardapios.categorias.store', {cnpj, cardapio_id}), categoriaDigitada)
            .then(() => {
                toast.success('Categoria cadastrada com sucesso.');
                setHandleDrawerUpsertCategoria(false)
                router.reload({ only: ['categorias', 'categoriaStatus'] })
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
            })
    }

    async function editarCategoria(categoriaDigitada: CategoriaFormData, categoria_id?: number) {
        const url = route('aplicacao.empresa.cardapios.categorias.update', {cnpj, cardapio_id, categoria_id})
        await axios.put(url, categoriaDigitada)
            .then((response) => {
                toast.success(response.data.message);
                setHandleDrawerUpsertCategoria(false)
                setCategoria(undefined)
                router.reload({ only: ['categorias', 'categoriaStatus'] })
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
            })
    }

    async function clonarCategoria() {
        setLoadingClonagemCategoria(true)
        await axios.post(route('aplicacao.empresa.cardapios.categorias.clone', {cnpj, cardapio_id, categoria_id: categoria?.id}))
            .then(() => {
                toast.success('Categoria clonada com sucesso')
                setCategoria(undefined)
                setHandleDialogClonagemCategoria(false)
                router.reload({ only: ['categorias', 'categoriaStatus'] })
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
            })
            .finally(() => setLoadingClonagemCategoria(false))
    }

    async function clonarItem() {
        if (!itemParaClonar) return
        setLoadingClonagemItem(true)
        await axios.post(route('aplicacao.empresa.cardapios.categorias.item.clone', {cnpj, cardapio_id, categoria_id: itemParaClonar.categoria_id, item_id: itemParaClonar.id}))
            .then((response) => {
                toast.success(response.data.mensagem ?? 'Item clonado com sucesso')
                setHandleDialogClonagemItem(false)
                carregarItensDaCategoria(itemParaClonar.categoria_id)
                router.reload({ only: ['categorias', 'categoriaStatus'] })
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
            })
            .finally(() => {
                setLoadingClonagemItem(false)
                setItemParaClonar(undefined)
            })
    }

    async function removerItem() {
        if (!itemParaRemover) return
        setLoadingRemocaoItem(true)
        await axios.delete(route('aplicacao.empresa.cardapios.categorias.item.destroy', {cnpj, cardapio_id, categoria_id: itemParaRemover.categoria_id, item_id: itemParaRemover.id}))
            .then((response) => {
                toast.success(response.data.mensagem ?? 'Item removido com sucesso')
                setHandleDialogRemocaoItem(false)
                carregarItensDaCategoria(itemParaRemover.categoria_id)
                router.reload({ only: ['categorias', 'categoriaStatus'] })
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
            })
            .finally(() => {
                setLoadingRemocaoItem(false)
                setItemParaRemover(undefined)
            })
    }

    async function removerCategoria() {
        setLoadingRemocaoCategoria(true)
        await axios.delete(route('aplicacao.empresa.cardapios.categorias.delete', {cnpj, cardapio_id, categoria_id: categoria?.id}))
            .then((response) => {
                toast.success(response.data.mensagem)
                setHandleDialogRemocaoCategoria(false)
                setCategoria(undefined)
                router.reload({ only: ['categorias', 'categoriaStatus'] })
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
            })
            .finally(() => setLoadingRemocaoCategoria(false))
    }

    // Utils

    async function setCategoriaAtual(categoria_id: number) {
        await axios.get(route('aplicacao.empresa.cardapios.categorias.show', {cnpj, cardapio_id, categoria_id}))
            .then((response) => {
                setCategoria(response.data.categoria)
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
            })
    }

    async function cadastraItem(item: TItem) {
        setIsSubmiting(true)
        return axios.post(route('aplicacao.empresa.cardapios.categorias.item.store', {cnpj, cardapio_id, categoria_id: item.categoria_id}), item)
            .then((response) => {
                toast.success('Item cadastrado com sucesso.')
                if (item.categoria_id) {
                    carregarItensDaCategoria(item.categoria_id)
                }
                router.reload({ only: ['categorias', 'categoriaStatus'] })
                setHandleDrawerUpsertItem(false)
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
                throw error
            })
            .finally(() => setIsSubmiting(false))
    }

    async function consultaItem(categoria_id: number, item_id: number, aoConcluir?: () => void) {
        setCarregandoItem(true)
        return axios.get(route('aplicacao.empresa.cardapios.categorias.item.show', {cnpj, cardapio_id, categoria_id, item_id}))
            .then((response) => {
                const itemConsultado: Partial<TItem> & {id?: number} = response.data.item
                const categoriaSelecionada = categoriasState?.find((c) => c.id === categoria_id)
                if (itemConsultado.tipo === 'PIZ' && categoriaSelecionada) {
                    itemConsultado.precos = mesclarPrecosComTamanhos(categoriaSelecionada.tamanhos, itemConsultado.precos)
                }
                setItem(itemConsultado)
                setCarregandoItem(false)
                aoConcluir?.()
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? 'Erro ao tentar consultar os dados do item, tente novamente.')
                setCarregandoItem(false)
            })
    }

    async function editaItem(item: TItem) {
        setIsSubmiting(true)
        return axios.put(route('aplicacao.empresa.cardapios.categorias.item.update', {cnpj, cardapio_id, categoria_id: item.categoria_id, item_id: item.id}), item)
            .then((response) => {
                toast.success(response.data.mensagem)
                if (item.categoria_id) {
                    carregarItensDaCategoria(item.categoria_id)
                }
                router.reload({ only: ['categorias', 'categoriaStatus'] })
                setHandleDrawerUpsertItem(false)
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
                throw error
            })
            .finally(() => setIsSubmiting(false))
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
                                                    onCriarItem={abreCadastroItem}
                                                    onCategoriaDuplicar={abreDialogConfirmacaoClonagemCategoria}
                                                    onCategoriaEditar={abreEdicaoCategoria}
                                                    onCategoriaRemover={abreRemocaoCategoria}
                                                    onItensAlterarStatus={() => {}}
                                                    onItensDuplicar={abreDialogConfirmacaoClonagemItem}
                                                    onItensEditar={abreEdicaoItem}
                                                    onItensRemover={abreDialogConfirmacaoRemocaoItem}
                                                    onItensAtualizaCodPdv={() => {}}
                                                    onItensAtualizaPreco={() => {}}
                                                    isSubmiting={carregandoItem}
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
            <UpsertCategoriaDrawer
                open={handleDrawerUpsertCategoria}
                onOpenChange={setHandleDrawerUpsertCategoria}
                categoria={categoria}
                diasSemana={DIAS_SEMANA}
                opcoesQtdSabores={QTD_SABORES}
                onSubmit={(dados) =>
                    categoria
                        ? editarCategoria(dados, categoria.id)
                        : cadastrarCategoria(dados)
                }
            />
            <UpsertItemDrawer
                item={item}
                open={handleDrawerUpsertItem}
                onOpenChange={setHandleDrawerUpsertItem}
                categorias={categorias}
                onSubmit={(dados: TItem) => !item?.id
                    ? cadastraItem(dados)
                    : editaItem(dados)
                }
                isSubmiting={isSubmiting}
            />
            <ConfirmarClonagemCategoriaDialog
                open={handleDialogClonagemCategoria}
                onOpenChange={setHandleDialogClonagemCategoria}
                categoria={categoria}
                loading={loadingClonagemCategoria}
                onSubmit={clonarCategoria}
            />
            <ConfirmarRemocaoCategoriaDialog
                open={handleDialogRemocaoCategoria}
                onOpenChange={setHandleDialogRemocaoCategoria}
                categoria={categoria}
                loading={loadingRemocaoCategoria}
                onSubmit={removerCategoria}
            />
            <ConfirmarClonagemItemDialog
                open={handleDialogClonagemItem}
                onOpenChange={setHandleDialogClonagemItem}
                item={itemParaClonar}
                loading={loadingClonagemItem}
                onSubmit={clonarItem}
            />
            <ConfirmarRemocaoItemDialog
                open={handleDialogRemocaoItem}
                onOpenChange={setHandleDialogRemocaoItem}
                item={itemParaRemover}
                loading={loadingRemocaoItem}
                onSubmit={removerItem}
            />
        </LayoutAutenticado>
    );
}
