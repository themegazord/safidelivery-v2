import { useEffect, useState } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Attachment, AttachmentMedia } from "@/components/ui/attachment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "@/components/ui/combobox";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import BuscaSelecaoPaginada, { IComplementoBuscaSelecionavel, IRespostaPaginada } from "@/components/utils/BuscaSelecaoPaginada";
import { apagarImagemPendente, DIA_SEMANA, DIAS_SEMANA, TDiaSemana } from "@/components/Empresa/Itens/UpsertItemDrawer";
import { ICategoria } from "@/types/empresa/cardapios/types";
import { converteReal } from "@/utils/utils";
import { Plus, Trash2 } from "lucide-react";

// Tipagens

interface IProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    combo?: TCombo
    categorias: ICategoria[]
    onSubmit: (dados: TCombo) => Promise<void>
    isSubmiting: boolean
}

type TComboMeta = {
    preco_combo?: number
    desconto_combo?: number
}

type TComboEntradaItem = {
    referencia_id: number
    nome_snapshot: string
    preco_snapshot: number
}

type TComboGrupo = {
    _key: string
    id?: number
    nome: string
    ordem?: number
    configuracao: {
        obrigatorio: boolean
        qtd_minima: number
        qtd_maxima: number
    }
    entradas: TComboEntradaItem[]
}

type TComboGrupoComplemento = {
    grupo_complemento_id: number
    nome: string
    obrigatoriedade: boolean
    qtd_minima: number
    qtd_maxima: number
    complementos: TComboEntradaItem[]
}

export type TCombo = {
    id?: number
    categoria_id?: number
    external_id?: string
    nome?: string
    descricao?: string
    imagem?: string
    dias_funcionamento?: (string | number)[]
    tipo_preco?: 'preco_combo' | 'preco_item'
    meta?: TComboMeta
    grupos?: TComboGrupo[]
    grupos_complemento?: TComboGrupoComplemento[]
}

type TItemBuscaSelecionavel = IComplementoBuscaSelecionavel & { preco: number }
type TGrupoComplementoBuscaSelecionavel = IComplementoBuscaSelecionavel & {
    obrigatoriedade: boolean
    qtd_minima: number
    qtd_maxima: number
    complementos: { id: number, nome: string, preco: number }[]
}

const TABS_COMBO = [
    { value: 'detalhes', label: 'Detalhes' },
    { value: 'preco', label: 'Preço' },
    { value: 'grupos', label: 'Grupos de itens' },
    { value: 'complementos', label: 'Complementos' },
] as const
type TTabCombo = typeof TABS_COMBO[number]['value']

const CAMPO_PARA_ABA: Record<string, TTabCombo> = {
    categoria_id: 'detalhes',
    nome: 'detalhes',
    external_id: 'detalhes',
    descricao: 'detalhes',
    imagem: 'detalhes',
    dias_funcionamento: 'detalhes',
    tipo_preco: 'preco',
    meta: 'preco',
    grupos: 'grupos',
    grupos_complemento: 'complementos',
}

function criarComboInicial(base?: Partial<TCombo> | null): TCombo {
    return {
        id: base?.id,
        categoria_id: base?.categoria_id,
        external_id: base?.external_id,
        nome: base?.nome,
        descricao: base?.descricao,
        imagem: base?.imagem,
        dias_funcionamento: base?.dias_funcionamento ?? [],
        tipo_preco: base?.tipo_preco ?? 'preco_combo',
        meta: base?.meta ?? {},
        grupos: (base?.grupos ?? []).map((grupo, idx) => ({ ...grupo, _key: grupo.id ? String(grupo.id) : `novo-${idx}` })),
        grupos_complemento: base?.grupos_complemento ?? [],
    }
}

function criarGrupoVazio(): TComboGrupo {
    return {
        _key: `novo-${Date.now()}-${Math.random()}`,
        nome: '',
        configuracao: { obrigatorio: true, qtd_minima: 1, qtd_maxima: 1 },
        entradas: [],
    }
}

function irParaAbaComErro(setTab: (tab: TTabCombo) => void, errors?: Record<string, string[]>) {
    const primeiroCampoComErro = Object.keys(errors ?? {})[0]
    if (!primeiroCampoComErro) return
    const chave = primeiroCampoComErro.split('.')[0]
    const aba = CAMPO_PARA_ABA[chave]
    if (aba) setTab(aba)
}

export default function UpsertItemComboDrawer({
    open,
    onOpenChange,
    combo: comboProp,
    categorias: categoriasProp,
    onSubmit,
    isSubmiting,
}: IProps) {
    const isEdicao = comboProp?.id !== undefined
    const [combo, setCombo] = useState<TCombo>(() => criarComboInicial(comboProp))
    const [imagemOriginal, setImagemOriginal] = useState<string | undefined>(() => comboProp?.imagem)
    const [tab, setTab] = useState<TTabCombo>('detalhes')
    const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false)
    const [grupoBuscaAberta, setGrupoBuscaAberta] = useState<string | null>(null)
    const [buscaGrupoComplementoAberta, setBuscaGrupoComplementoAberta] = useState<boolean>(false)
    const diasFuncionamentoAnchor = useComboboxAnchor()

    const { cnpj, cardapio_id } = usePage<{ cnpj: string, cardapio_id: string }>().props

    const categorias = categoriasProp
        .filter((categoria) => categoria.tipo === 'I')
        .map((categoria) => ({ label: categoria.nome, value: String(categoria.id) }))

    useEffect(() => {
        if (!open) return
        setCombo(criarComboInicial(comboProp))
        setImagemOriginal(comboProp?.imagem)
        setTab('detalhes')
        setGrupoBuscaAberta(null)
        setBuscaGrupoComplementoAberta(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    function handleOpenChange(value: boolean) {
        if (!value && combo.imagem && combo.imagem !== imagemOriginal) {
            apagarImagemPendente(cnpj, cardapio_id, String(combo.categoria_id), combo.imagem)
        }
        onOpenChange(value)
    }

    function atualizaCombo(patch: Partial<TCombo>) {
        setCombo((prev) => ({ ...prev, ...patch }))
    }

    function atualizaMeta(patch: Partial<TComboMeta>) {
        setCombo((prev) => ({ ...prev, meta: { ...prev.meta, ...patch } }))
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        uploadImagem(file)
    }

    async function uploadImagem(file: File) {
        setIsUploadingImage(true)
        const imagemAnterior = combo.imagem
        const formData = new FormData()
        formData.append('imagem', file)
        await axios.post(route('aplicacao.empresa.cardapios.categorias.item.store-imagem', {
            cnpj,
            cardapio_id,
            categoria_id: combo.categoria_id,
        }), formData)
            .then((response) => {
                atualizaCombo({ imagem: response.data.url })
                if (imagemAnterior && imagemAnterior !== imagemOriginal) {
                    apagarImagemPendente(cnpj, cardapio_id, String(combo.categoria_id), imagemAnterior)
                }
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
            })
            .finally(() => setIsUploadingImage(false))
    }

    // Grupos de itens

    function adicionaGrupo() {
        setCombo((prev) => ({ ...prev, grupos: [...(prev.grupos ?? []), criarGrupoVazio()] }))
    }

    function removeGrupo(chave: string) {
        setCombo((prev) => ({ ...prev, grupos: (prev.grupos ?? []).filter((grupo) => grupo._key !== chave) }))
    }

    function atualizaGrupo(chave: string, patch: Partial<Omit<TComboGrupo, '_key' | 'entradas'>>) {
        setCombo((prev) => ({
            ...prev,
            grupos: (prev.grupos ?? []).map((grupo) => grupo._key === chave ? { ...grupo, ...patch } : grupo),
        }))
    }

    function adicionaItensAoGrupo(chave: string, itens: TItemBuscaSelecionavel[]) {
        setCombo((prev) => ({
            ...prev,
            grupos: (prev.grupos ?? []).map((grupo) => {
                if (grupo._key !== chave) return grupo
                const jaAdicionados = grupo.entradas.map((entrada) => entrada.referencia_id)
                const novasEntradas = itens
                    .filter((item) => !jaAdicionados.includes(item.id))
                    .map((item) => ({ referencia_id: item.id, nome_snapshot: item.nome, preco_snapshot: item.preco }))
                return { ...grupo, entradas: [...grupo.entradas, ...novasEntradas] }
            }),
        }))
        setGrupoBuscaAberta(null)
    }

    function removeItemDoGrupo(chave: string, referencia_id: number) {
        setCombo((prev) => ({
            ...prev,
            grupos: (prev.grupos ?? []).map((grupo) => grupo._key === chave
                ? { ...grupo, entradas: grupo.entradas.filter((entrada) => entrada.referencia_id !== referencia_id) }
                : grupo),
        }))
    }

    async function buscaItensParaCombo({ busca, page }: { busca: string, page: number }): Promise<IRespostaPaginada<TItemBuscaSelecionavel>> {
        const resposta = await axios.get(route('aplicacao.empresa.cardapios.categorias.combo.buscaItensParaCombo', {
            cnpj,
            cardapio_id,
            categoria_id: combo.categoria_id,
        }), { params: { busca, page } })

        return resposta.data.itens
    }

    // Grupos de complemento

    function anexaGruposComplemento(grupos: TGrupoComplementoBuscaSelecionavel[]) {
        setCombo((prev) => ({
            ...prev,
            grupos_complemento: [
                ...(prev.grupos_complemento ?? []),
                ...grupos.map((grupo) => ({
                    grupo_complemento_id: grupo.id,
                    nome: grupo.nome,
                    obrigatoriedade: grupo.obrigatoriedade,
                    qtd_minima: grupo.qtd_minima,
                    qtd_maxima: grupo.qtd_maxima,
                    complementos: grupo.complementos.map((complemento) => ({
                        referencia_id: complemento.id,
                        nome_snapshot: complemento.nome,
                        preco_snapshot: complemento.preco,
                    })),
                })),
            ],
        }))
        setBuscaGrupoComplementoAberta(false)
    }

    function removeGrupoComplemento(grupo_complemento_id: number) {
        setCombo((prev) => ({
            ...prev,
            grupos_complemento: (prev.grupos_complemento ?? []).filter((grupo) => grupo.grupo_complemento_id !== grupo_complemento_id),
        }))
    }

    function removeComplementoDoGrupo(grupo_complemento_id: number, referencia_id: number) {
        setCombo((prev) => ({
            ...prev,
            grupos_complemento: (prev.grupos_complemento ?? []).map((grupo) => grupo.grupo_complemento_id === grupo_complemento_id
                ? { ...grupo, complementos: grupo.complementos.filter((complemento) => complemento.referencia_id !== referencia_id) }
                : grupo),
        }))
    }

    async function buscaGruposComplementoParaCombo({ busca, page }: { busca: string, page: number }): Promise<IRespostaPaginada<TGrupoComplementoBuscaSelecionavel>> {
        const resposta = await axios.get(route('aplicacao.empresa.cardapios.categorias.combo.buscaGruposComplementoParaCombo', {
            cnpj,
            cardapio_id,
            categoria_id: combo.categoria_id,
        }), { params: { busca, page } })

        return resposta.data.grupos
    }

    // Envio

    function proximo() {
        if (tab === 'detalhes') return setTab('preco')
        if (tab === 'preco') return setTab('grupos')
        if (tab === 'grupos') return setTab('complementos')
        onSubmit(combo).catch((error) => irParaAbaComErro(setTab, error?.response?.data?.errors))
    }

    return (
        <Drawer open={open} onOpenChange={handleOpenChange} swipeDirection="right">
            <DrawerContent className="w-full p-6 lg:w-[55vw]">
                <DrawerHeader>
                    <DrawerTitle>{isEdicao ? 'Editar combo' : 'Adicionar combo'}</DrawerTitle>
                    <DrawerDescription>Monte um combo combinando itens do cardápio e grupos de complemento já cadastrados.</DrawerDescription>
                </DrawerHeader>
                <Tabs value={tab} onValueChange={(v) => setTab(v as TTabCombo)} className="min-h-0 flex-1">
                    <TabsList className="w-full">
                        {TABS_COMBO.map((t) => (
                            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="detalhes" className="flex min-h-0 flex-col">
                        <div className="h-[80vh] overflow-y-scroll my-4">
                            <div className="m-4 flex flex-1 min-h-0 flex-col gap-4">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="categoria_id">Categoria</FieldLabel>
                                    <Select
                                        id="categoria_id"
                                        items={categorias}
                                        value={categorias.find((categoria) => categoria.value === String(combo.categoria_id))?.value}
                                        onValueChange={(e) => atualizaCombo({ categoria_id: Number(e) })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Categorias</SelectLabel>
                                                {categorias.map((categoria) => (
                                                    <SelectItem key={categoria.value} value={categoria.value}>{categoria.label}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <FieldGroup className="flex flex-col sm:grid sm:grid-cols-5 gap-4 w-full">
                                    <Field className="w-full sm:col-span-4">
                                        <FieldLabel htmlFor="nome">Nome do combo</FieldLabel>
                                        <Input key={combo.nome} id="nome" defaultValue={combo.nome ?? ''} onBlur={(e) => atualizaCombo({ nome: e.target.value })} />
                                    </Field>
                                    <Field className="w-full sm:col-span-1">
                                        <FieldLabel htmlFor="external_id">Código PDV.</FieldLabel>
                                        <Input key={combo.external_id} id="external_id" defaultValue={combo.external_id ?? ''} onBlur={(e) => atualizaCombo({ external_id: e.target.value })} />
                                    </Field>
                                </FieldGroup>
                                <div className="flex gap-4">
                                    <label className="cursor-pointer">
                                        <Attachment state={isUploadingImage ? 'uploading' : 'idle'} orientation={'vertical'} className="size-52">
                                            <AttachmentMedia variant={'image'}>
                                                {isUploadingImage ? (
                                                    <Spinner />
                                                ) : (
                                                    <img className="h-full w-full object-cover" src={combo.imagem ?? 'https://placehold.co/300'} alt="Imagem do combo" />
                                                )}
                                            </AttachmentMedia>
                                        </Attachment>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                    <Field className="flex flex-1 flex-col">
                                        <FieldLabel>Descrição</FieldLabel>
                                        <Textarea
                                            key={combo.descricao}
                                            defaultValue={combo.descricao ?? ''}
                                            onBlur={(e) => atualizaCombo({ descricao: e.target.value })}
                                            className="flex-1 resize-none"
                                        />
                                    </Field>
                                </div>
                                <Field>
                                    <div className="flex items-center justify-between">
                                        <FieldLabel htmlFor="dias_funcionamento">Dias de funcionamento</FieldLabel>
                                        <div className="flex gap-3 text-xs">
                                            <button type="button" className="text-primary hover:underline" onClick={() => atualizaCombo({ dias_funcionamento: DIAS_SEMANA.map((dia) => dia.value) })}>
                                                Selecionar todos
                                            </button>
                                            <button type="button" className="text-muted-foreground hover:underline" onClick={() => atualizaCombo({ dias_funcionamento: [] })}>
                                                Remover todos
                                            </button>
                                        </div>
                                    </div>
                                    <Combobox
                                        id="dias_funcionamento"
                                        items={DIAS_SEMANA}
                                        multiple
                                        itemToStringValue={(item: TDiaSemana) => item.label}
                                        value={DIAS_SEMANA.filter((ds) => combo.dias_funcionamento?.includes(ds.value))}
                                        onValueChange={(itens: TDiaSemana[]) => atualizaCombo({ dias_funcionamento: itens.map((dia) => dia.value) })}
                                    >
                                        <ComboboxChips ref={diasFuncionamentoAnchor}>
                                            <ComboboxValue>
                                                {combo.dias_funcionamento?.map((df) => (
                                                    <ComboboxChip key={df}>{DIA_SEMANA(Number(df))}</ComboboxChip>
                                                ))}
                                                <ComboboxChipsInput />
                                            </ComboboxValue>
                                        </ComboboxChips>
                                        <ComboboxContent anchor={diasFuncionamentoAnchor}>
                                            <ComboboxEmpty>Não contêm dias a ser informado</ComboboxEmpty>
                                            <ComboboxList>
                                                {(item: TDiaSemana) => (
                                                    <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </Field>
                            </FieldGroup>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="preco" className="flex min-h-0 flex-col">
                        <div className="h-[80vh] overflow-y-scroll my-4">
                            <div className="m-4 flex flex-1 min-h-0 flex-col gap-4">
                            <RadioGroup
                                value={combo.tipo_preco}
                                onValueChange={(v) => atualizaCombo({ tipo_preco: v as TCombo['tipo_preco'] })}
                                className="grid grid-cols-1 gap-4 md:grid-cols-2"
                            >
                                <Card>
                                    <CardContent>
                                        <Label htmlFor="preco_combo" className="flex flex-col items-start gap-2 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem value="preco_combo" id="preco_combo" />
                                                <span className="font-bold">Preço fixo do combo</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">O combo tem um preço único, independente dos itens escolhidos.</span>
                                        </Label>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent>
                                        <Label htmlFor="preco_item" className="flex flex-col items-start gap-2 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem value="preco_item" id="preco_item" />
                                                <span className="font-bold">Soma dos itens escolhidos</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">O preço é a soma dos itens selecionados pelo cliente, com desconto opcional.</span>
                                        </Label>
                                    </CardContent>
                                </Card>
                            </RadioGroup>

                            {combo.tipo_preco === 'preco_combo' ? (
                                <Field className="w-full max-w-56">
                                    <FieldLabel htmlFor="preco_combo_valor">Preço do combo</FieldLabel>
                                    <InputGroup>
                                        <InputGroupAddon align={'inline-start'}>R$</InputGroupAddon>
                                        <InputGroupInput
                                            key={combo.meta?.preco_combo}
                                            id="preco_combo_valor"
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            defaultValue={combo.meta?.preco_combo ?? ''}
                                            onBlur={(e) => atualizaMeta({ preco_combo: Number(e.target.value) })}
                                        />
                                    </InputGroup>
                                </Field>
                            ) : (
                                <>
                                    <Alert>
                                        <AlertTitle>Desconto sobre a soma dos itens</AlertTitle>
                                        <AlertDescription>Opcional. Aplicado sobre o total dos itens que o cliente escolher no combo.</AlertDescription>
                                    </Alert>
                                    <Field className="w-full max-w-56">
                                        <FieldLabel htmlFor="desconto_combo">Desconto</FieldLabel>
                                        <InputGroup>
                                            <InputGroupAddon align={'inline-start'}>R$</InputGroupAddon>
                                            <InputGroupInput
                                                key={combo.meta?.desconto_combo}
                                                id="desconto_combo"
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                defaultValue={combo.meta?.desconto_combo ?? ''}
                                                onBlur={(e) => atualizaMeta({ desconto_combo: Number(e.target.value) })}
                                            />
                                        </InputGroup>
                                    </Field>
                                </>
                            )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="grupos" className="flex min-h-0 flex-col gap-4">
                        <div className="h-[80vh] overflow-y-scroll my-4">
                            <div className="m-4 flex flex-1 min-h-0 flex-col gap-4">
                            {(combo.grupos ?? []).map((grupo) => (
                                <Card key={grupo._key}>
                                    <CardHeader>
                                        <CardTitle>
                                            <Input
                                                key={grupo.nome}
                                                placeholder="Nome do grupo (ex: Escolha o prato)"
                                                defaultValue={grupo.nome}
                                                onBlur={(e) => atualizaGrupo(grupo._key, { nome: e.target.value })}
                                            />
                                        </CardTitle>
                                        <CardAction>
                                            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeGrupo(grupo._key)}>
                                                <Trash2 />
                                            </Button>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <Field orientation={'horizontal'} className="gap-2">
                                                <Switch
                                                    checked={grupo.configuracao.obrigatorio}
                                                    onCheckedChange={(checked) => atualizaGrupo(grupo._key, { configuracao: { ...grupo.configuracao, obrigatorio: checked } })}
                                                />
                                                <FieldLabel>Obrigatório</FieldLabel>
                                            </Field>
                                            <Field>
                                                <FieldLabel>Qtd. mínima</FieldLabel>
                                                <Input
                                                    key={grupo.configuracao.qtd_minima}
                                                    type="number"
                                                    min={0}
                                                    defaultValue={grupo.configuracao.qtd_minima}
                                                    onBlur={(e) => atualizaGrupo(grupo._key, { configuracao: { ...grupo.configuracao, qtd_minima: Number(e.target.value) } })}
                                                />
                                            </Field>
                                            <Field>
                                                <FieldLabel>Qtd. máxima</FieldLabel>
                                                <Input
                                                    key={grupo.configuracao.qtd_maxima}
                                                    type="number"
                                                    min={1}
                                                    defaultValue={grupo.configuracao.qtd_maxima}
                                                    onBlur={(e) => atualizaGrupo(grupo._key, { configuracao: { ...grupo.configuracao, qtd_maxima: Number(e.target.value) } })}
                                                />
                                            </Field>
                                        </div>

                                        {grupo.entradas.length > 0 && (
                                            <div className="flex flex-col gap-2">
                                                {grupo.entradas.map((entrada) => (
                                                    <div key={entrada.referencia_id} className="flex items-center justify-between rounded-md border px-4 py-2">
                                                        <p>{entrada.nome_snapshot}</p>
                                                        <div className="flex items-center gap-4">
                                                            <b>R$ {converteReal(entrada.preco_snapshot)}</b>
                                                            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeItemDoGrupo(grupo._key, entrada.referencia_id)}>
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {grupoBuscaAberta === grupo._key ? (
                                            <BuscaSelecaoPaginada<TItemBuscaSelecionavel>
                                                titulo="Adicionar itens ao grupo"
                                                nomeItem="item"
                                                placeholder="Escreva o nome do item"
                                                buscar={buscaItensParaCombo}
                                                onAdicionar={(itens) => adicionaItensAoGrupo(grupo._key, itens)}
                                                fecharComponente={() => setGrupoBuscaAberta(null)}
                                                idsJaAdicionados={grupo.entradas.map((entrada) => entrada.referencia_id)}
                                            />
                                        ) : (
                                            <Button type="button" variant={'outline'} onClick={() => setGrupoBuscaAberta(grupo._key)}>
                                                <Plus /> Adicionar itens
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}

                            <Button type="button" variant={'outline'} onClick={adicionaGrupo}>
                                <Plus /> Adicionar grupo de itens
                            </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="complementos" className="flex min-h-0 flex-col gap-4">
                        <div className="h-[80vh] overflow-y-scroll my-4">
                            <div className="m-4 flex flex-1 min-h-0 flex-col gap-4">
                            <div className="flex flex-col">
                                <p className="text-lg font-bold md:text-xl">Grupos de complemento</p>
                                <p className="text-sm text-muted-foreground md:text-base">Anexe grupos de complemento já cadastrados em outros itens (ex: sabores, adicionais).</p>
                            </div>

                            {(combo.grupos_complemento ?? []).map((grupo) => (
                                <Card key={grupo.grupo_complemento_id}>
                                    <CardHeader>
                                        <CardTitle>{grupo.nome}</CardTitle>
                                        <CardAction className="flex items-center gap-2">
                                            <Badge variant={grupo.obrigatoriedade ? 'default' : 'secondary'}>
                                                {grupo.obrigatoriedade ? 'Obrigatório' : 'Opcional'}
                                            </Badge>
                                            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeGrupoComplemento(grupo.grupo_complemento_id)}>
                                                <Trash2 />
                                            </Button>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-2">
                                        {grupo.complementos.map((complemento) => (
                                            <div key={complemento.referencia_id} className="flex items-center justify-between px-4">
                                                <p>{complemento.nome_snapshot}</p>
                                                <div className="flex items-center gap-4">
                                                    <b>R$ {converteReal(complemento.preco_snapshot)}</b>
                                                    <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeComplementoDoGrupo(grupo.grupo_complemento_id, complemento.referencia_id)}>
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}

                            {buscaGrupoComplementoAberta ? (
                                <BuscaSelecaoPaginada<TGrupoComplementoBuscaSelecionavel>
                                    titulo="Anexar grupo de complemento"
                                    nomeItem="grupo"
                                    placeholder="Escreva o nome do grupo de complemento"
                                    buscar={buscaGruposComplementoParaCombo}
                                    onAdicionar={anexaGruposComplemento}
                                    fecharComponente={() => setBuscaGrupoComplementoAberta(false)}
                                    idsJaAdicionados={(combo.grupos_complemento ?? []).map((grupo) => grupo.grupo_complemento_id)}
                                />
                            ) : (
                                <Button type="button" variant={'outline'} onClick={() => setBuscaGrupoComplementoAberta(true)}>
                                    <Plus /> Anexar grupo de complemento
                                </Button>
                            )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
                <DrawerFooter className="flex flex-row-reverse">
                    <Button disabled={isSubmiting} onClick={proximo}>
                        {tab === 'complementos' ? (
                            isEdicao ? (
                                isSubmiting ? (<><Spinner /> Salvando...</>) : 'Salvar'
                            ) : (
                                isSubmiting ? (<><Spinner /> Cadastrando...</>) : 'Cadastrar'
                            )
                        ) : 'Continuar'}
                    </Button>
                    <DrawerClose render={<Button variant={'destructive'} />} disabled={isSubmiting}>Cancelar</DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
