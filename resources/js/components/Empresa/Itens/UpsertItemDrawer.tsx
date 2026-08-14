import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Attachment, AttachmentContent, AttachmentMedia, AttachmentTitle } from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "@/components/ui/combobox";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { H5, H6 } from "@/components/utils/Heading";
import { ICategoria } from "@/types/empresa/cardapios/types";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { AlertCircle, AlertTriangle, Beer, CandyOff, ChevronDownIcon, Citrus, CookingPot, Copy, Leaf, Loader, LucideIcon, MilkOff, Pizza, Plus, ScanBarcode, Snowflake, Sprout, User, Users, UsersRound, Wheat, Wine } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { converteReal } from "@/utils/utils";
import { Separator } from "@base-ui/react";

// Tipagens
interface IProps {
  open: boolean
  onOpenChange: (value: boolean) => void,
  item?: TItem,
  categorias: ICategoria[]
  onSubmit: (dados: TItem) => Promise<void>
  isSubmiting: boolean
  onOpenDrawerGrupoComplemento: (value: boolean) => void
  grupoComplementoAtualizadoEm?: number
}
interface IItemBase {
  id?: number
  categoria_id?: number
  categoria_tipo?: 'I' | 'P'
  external_id?: string
  tipo?: 'PRE' | 'BEB' | 'IND' | 'PIZ'
  nome?: string
  tipo_preco?: 'preco_combo' | 'preco_item' | 'fixo'
  preco?: number
  desconto?: boolean
  valor_desconto?: number
  porcentagem_desconto?: number
  descricao?: string
  eh_bebida?: boolean
  classificacao?: ClassificacaoStatus[],
  imagem?: string,
  dias_funcionamento?: (string | number)[],
}
interface IItemNormal {
  peso?: string | number,
  gramagem?: string,
  qtde_pessoas?: number,
  grupo_complementos?: TGrupoComplemento[]
}
interface IItemPizza {
  precos?: TPrecoPizza[]
}
type TGrupoComplemento = {
    id?: number,
    item_id?: number,
    nome?: string,
    obrigatoriedade?: boolean,
    qtd_minima?: number,
    qtd_maxima?: number,
    complementos?: TComplementos[]
}
type TComplementos = {
    id?: number,
    external_id?: number,
    grupo_id?: number,
    nome?: string,
    descricao?: string,
    preco?: number,
    status?: boolean
}
type TPrecoPizza = {
  tamanho_id?: number
  tamanho?: string
  status?: boolean
  preco?: number
  dias_funcionamento?: number[]
}

export type TItem = IItemBase & IItemNormal & IItemPizza

export type TCategoria = {label: string, value: string}
export type TItemParaCopiaGrupoComplemento = {label: string, value: string}

type ClassificacaoStatus = { value: string, status: boolean }

interface ClassificacaoOption {
  id: string
  label: string
  description: string
  icon: LucideIcon
}

const CLASSIFICACOES_COMIDA: ClassificacaoOption[] = [
    { id: 'vegetariano', label: 'Vegetariano', description: 'Sem carne de nenhum tipo', icon: Leaf },
    { id: 'vegano', label: 'Vegano', description: 'Sem produtos de origem animal, como carne, ovo ou leite', icon: Sprout },
    { id: 'organico', label: 'Orgânico', description: 'Cultivado sem agrotóxicos, segundo a lei 10.831', icon: Wheat },
    { id: 'sem_acucar', label: 'Sem açúcar', description: 'Não contém nenhum tipo de açúcar (cristal, orgânico, mascavo etc.)', icon: CandyOff },
    { id: 'zero_lactose', label: 'Zero lactose', description: 'Não contém lactose, ou seja, leite e seus derivados', icon: MilkOff },
]

const CLASSIFICACOES_BEBIDA: ClassificacaoOption[] = [
    { id: 'bebida_gelada', label: 'Bebida Gelada', description: 'Da geladeira direto para o consumidor', icon: Snowflake },
    { id: 'bebida_alcoolica', label: 'Bebida alcoólica', description: 'De 0,5% a 54% em volume, destilados, fermentados etc', icon: Wine },
    { id: 'bebida_natural', label: 'Bebida natural', description: 'Preparados na hora com frutas frescas', icon: Citrus },
]

const RESTRICOES_BEBIDA: ClassificacaoOption[] = [
    { id: 'bebida_zero_lactose', label: 'Zero Lactose', description: 'Não contém lactose, ou seja, leite e seus derivados', icon: MilkOff },
    { id: 'bebida_diet_zero', label: 'Bebida diet', description: 'Sem adição de açúcares', icon: CandyOff },
]

// Remove uma imagem ainda não vinculada a um item salvo (best-effort: se
// falhar aqui, a limpeza agendada no backend remove mais tarde).
async function apagarImagemPendente(cnpj: string, cardapio_id: string, categoria_id: string, url: string) {
  await axios.delete(route('aplicacao.empresa.cardapios.categorias.item.destroy-imagem', {
    cnpj,
    cardapio_id,
    categoria_id
  }), { data: { url } }).catch(() => {})
}

type TBotoesSelecionarTipoItem = {
  tipo: 'PRE' | 'BEB' | 'IND',
  title: string,
  description: string,
  icon: ReactNode
}

// Constantes

type TDiaSemana = {
    label: string;
    value: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

const DIAS_SEMANA: TDiaSemana[] = [
    { label: 'Domingo', value: 0 },
    { label: 'Segunda-feira', value: 1 },
    { label: 'Terça-feira', value: 2 },
    { label: 'Quarta-feira', value: 3 },
    { label: 'Quinta-feira', value: 4 },
    { label: 'Sexta-feira', value: 5 },
    { label: 'Sábado', value: 6 },
]

export const DIA_SEMANA = (value: number) =>
    DIAS_SEMANA.find((ds) => ds.value === value)?.label ?? "—";

// Funções

// Normaliza o `classificacao` vindo do backend pro formato {value, status}[]
// usado pelo drawer. Precisa lidar com três formatos possíveis:
// - undefined (item novo): todas as opções com status false.
// - string[] (formato salvo corretamente, ex: ["vegano","organico"]).
// - objeto com chaves não-sequenciais (bug antigo: array_filter sem
//   array_values fazia o PHP serializar como objeto JSON em vez de array).
function normalizarClassificacao(classificacao: unknown): ClassificacaoStatus[] {
  const todasOpcoes = [...CLASSIFICACOES_COMIDA, ...CLASSIFICACOES_BEBIDA, ...RESTRICOES_BEBIDA]

  if (Array.isArray(classificacao) && classificacao.length > 0 && typeof classificacao[0] === 'object' && classificacao[0] !== null && 'value' in classificacao[0]) {
    return classificacao as ClassificacaoStatus[]
  }

  const ativas: string[] = Array.isArray(classificacao)
    ? (classificacao as string[])
    : classificacao && typeof classificacao === 'object'
      ? Object.values(classificacao as Record<string, string>)
      : []

  return todasOpcoes.map((opcao) => ({
    value: opcao.id,
    status: ativas.includes(opcao.id),
  }))
}

function criarItemInicial(
  base?: Partial<TItem> | null
): TItem {
  return {
    id: base?.id,
    categoria_id: base?.categoria_id,
    categoria_tipo: base?.categoria_tipo,
    external_id: base?.external_id,
    tipo: base?.tipo,
    nome: base?.nome,
    tipo_preco: base?.tipo_preco,
    preco: base?.preco,
    desconto: base?.desconto,
    valor_desconto: base?.valor_desconto,
    porcentagem_desconto: base?.porcentagem_desconto,
    descricao: base?.descricao,
    eh_bebida: base?.eh_bebida,
    classificacao: normalizarClassificacao(base?.classificacao),
    imagem: base?.imagem,
    dias_funcionamento: base?.dias_funcionamento,
    peso: base?.peso,
    gramagem: base?.gramagem,
    qtde_pessoas: base?.qtde_pessoas,
    precos: base?.precos,
    grupo_complementos: base?.grupo_complementos,
  }
}

function criarCategoriasIniciais(categorias: ICategoria[], categoria_tipo: 'I' | 'P'): TCategoria[] {
    return categorias.filter(categoria => categoria.tipo === categoria_tipo).map(function (categoria) {
        return {label: categoria.nome, value: String(categoria.id)}
    })
}

type TEventInputItem = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

function handleInputsItem(
    setItem: (value: React.SetStateAction<TItem>) => void,
    e: TEventInputItem | string | number | boolean | TDiaSemana[] | null,
    target: string
) {
    const value = Array.isArray(e)
        ? e.map((diaSemana) => diaSemana.value)
        : typeof e === 'string' || typeof e === 'number' || typeof e === 'boolean' || e === null
            ? e
            : e.currentTarget.value;

    setItem(prev => ({
        ...prev!,
        [target]: value
    }))
}

function ClassificacaoItem({
    option,
    checked,
    onToggle,
}: {
    option: ClassificacaoOption
    checked: boolean
    onToggle: (checked: boolean) => void
}) {
    const Icon = option.icon

    return (
        <div className="flex items-center gap-4">
            <Checkbox
                id={option.id}
                checked={checked}
                onCheckedChange={(value) => onToggle(value === true)}
            />
            <label htmlFor={option.id} className="flex cursor-pointer items-center gap-4">
                <Icon className="h-7.5 w-7.5" />
                <div className="flex flex-col gap-1">
                    <p className="text-lg">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
            </label>
        </div>
    )
}

function PizzaPrecoCard({
    preco,
    onChange,
}: {
    preco: TPrecoPizza
    onChange: (patch: Partial<TPrecoPizza>) => void
}) {
    const diasFuncionamentoAnchor = useComboboxAnchor()

    return (
        <Card className="w-full">
            <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <Pizza className="shrink-0" />
                    <Field orientation={'horizontal'} className="w-fit shrink-0 gap-2">
                        <Checkbox
                            id={`preco-status-${preco.tamanho_id}`}
                            name={`preco-status-${preco.tamanho_id}`}
                            checked={preco.status ?? false}
                            onCheckedChange={(value) => onChange({ status: value === true })}
                        />
                        <FieldLabel htmlFor={`preco-status-${preco.tamanho_id}`}>{preco.tamanho}</FieldLabel>
                    </Field>
                    <Field className="w-full max-w-56">
                        <InputGroup>
                            <InputGroupAddon align={'inline-start'}>R$</InputGroupAddon>
                            <InputGroupInput
                                key={preco.preco}
                                type="number"
                                min={0}
                                step="0.01"
                                defaultValue={preco.preco ?? ''}
                                onBlur={(e) => onChange({ preco: Number(e.target.value) })}
                            />
                        </InputGroup>
                    </Field>
                </div>
                <Field className="w-full">
                    <div className="flex items-center justify-between">
                        <FieldLabel htmlFor={`dias-funcionamento-${preco.tamanho_id}`}>
                            Dias de funcionamento
                        </FieldLabel>
                        <div className="flex gap-3 text-xs">
                            <button
                                type="button"
                                className="text-primary hover:underline"
                                onClick={() => onChange({ dias_funcionamento: DIAS_SEMANA.map((dia) => dia.value) })}
                            >
                                Selecionar todos
                            </button>
                            <button
                                type="button"
                                className="text-muted-foreground hover:underline"
                                onClick={() => onChange({ dias_funcionamento: [] })}
                            >
                                Remover todos
                            </button>
                        </div>
                    </div>
                    <Combobox
                        id={`dias-funcionamento-${preco.tamanho_id}`}
                        items={DIAS_SEMANA}
                        multiple
                        itemToStringValue={(item: TDiaSemana) => item.label}
                        value={DIAS_SEMANA.filter((ds) => preco.dias_funcionamento?.includes(ds.value))}
                        onValueChange={(itens: TDiaSemana[]) =>
                            onChange({ dias_funcionamento: itens.map((dia) => dia.value) })
                        }
                    >
                        <ComboboxChips ref={diasFuncionamentoAnchor}>
                            <ComboboxValue>
                                {preco.dias_funcionamento?.map((df) => (
                                    <ComboboxChip key={df}>{DIA_SEMANA(Number(df))}</ComboboxChip>
                                ))}
                                <ComboboxChipsInput />
                            </ComboboxValue>
                        </ComboboxChips>
                        <ComboboxContent anchor={diasFuncionamentoAnchor}>
                            <ComboboxEmpty>
                                Não contêm dias a ser informado
                            </ComboboxEmpty>
                            <ComboboxList>
                                {(item: TDiaSemana) => (
                                    <ComboboxItem key={item.value} value={item}>
                                        {item.label}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </Field>
            </CardContent>
        </Card>
    )
}

// DrawerContent ItemNormal

function DrawerContentItemNormal({
  setItem: setItemProp,
  item: itemProp,
  imagemOriginal,
  cnpj,
  cardapio_id,
  categorias,
  onSubmit,
  isSubmiting,
  isEditing,
  open,
  onOpenDrawerGrupoComplemento
}: {
  item: TItem
  setItem: React.Dispatch<React.SetStateAction<TItem>>
  imagemOriginal?: string
  cnpj: string,
  cardapio_id: string
  categorias: TCategoria[]
  isEditing: boolean
  isSubmiting: boolean
  onSubmit: () => Promise<void>
  open: boolean
  onOpenDrawerGrupoComplemento: (value: boolean) => void
}) {
  type TTab = 'detalhes' | 'preco_estoque' | 'classificacao' | 'complementos';
  const ITEM_NORMAL_TABS = [
    {value: 'detalhes', label: 'Detalhes'},
    {value: 'preco_estoque', label: 'Preço e Estoque'},
    {value: 'complementos', label: 'Complementos'},
    {value: 'classificacao', label: 'Classificação'},
  ] as const
  const CAMPO_PARA_ABA: Record<string, TTab> = {
    categoria_id: 'detalhes',
    nome: 'detalhes',
    external_id: 'detalhes',
    descricao: 'detalhes',
    dias_funcionamento: 'detalhes',
    qtde_pessoas: 'detalhes',
    peso: 'detalhes',
    gramagem: 'detalhes',
    preco: 'preco_estoque',
    desconto: 'preco_estoque',
    valor_desconto: 'preco_estoque',
    porcentagem_desconto: 'preco_estoque',
    eh_bebida: 'classificacao',
    classificacao: 'classificacao',
  }
  const [tab, setTab] = useState<TTab>('detalhes')
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false)
  const [handleCopiaComplemento, setHandleCopiaComplemento] = useState<boolean>(false)
  const [handleCategoriaParaCopiaGrupoComplemento, setHandleCategoriaParaCopiaGrupoComplemento] = useState<number | undefined>(undefined)
  const [handleItemParaCopiaGrupoComplemento, setHandleItemParaCopiaGrupoComplemento] = useState<number | undefined>(undefined)
  const [itensCategoriaSelecionadaParaCopiaGrupoComplemento, setItensCategoriaSelecionadaParaCopiaGrupoComplemento] = useState<TItemParaCopiaGrupoComplemento[]>([])
  const [loadingItensPorCategoria, setLoadingItensPorCategoria] = useState<boolean>(false)
  const [loadingCopiaGrupoComplemento, setLoadingCopiaGrupoComplemento] = useState<boolean>(false)

  // Reseta pra aba inicial toda vez que o drawer é reaberto, senão fica
  // preso na última aba usada no item anterior.
  useEffect(() => {
    if (open) setTab('detalhes')
  }, [open])

  function irParaAbaComErro(errors?: Record<string, string[]>) {
    const primeiroCampoComErro = Object.keys(errors ?? {})[0]
    const aba = CAMPO_PARA_ABA[primeiroCampoComErro]
    if (aba) setTab(aba)
  }
  const diasFuncionamentoAnchor = useComboboxAnchor()
  const QTDE_PESSOAS_INFO: TQtdePessoasInfo[] = [
    {value: '0', label: 'Não se aplica', icon: null},
    {value: '1', label: '1 pessoa', icon: <User />},
    {value: '2', label: '2 pessoas', icon: <Users />},
    {value: '3', label: '3+ pessoas', icon: <UsersRound />},
  ]
  type TQtdePessoasInfo = {value: string, label: string, icon: ReactNode}
  const GRAMAGEM_INFO = [
    {value: 'g', label: 'g'},
    {value: 'Kg', label: 'Kg'},
  ] as const
    function atualizarPrecoPizza(index: number, patch: Partial<TPrecoPizza>) {
        setItemProp((prev) => ({
            ...prev,
            precos: prev.precos?.map((preco, i) => (i === index ? { ...preco, ...patch } : preco))
        }))
    }

    const toggleClassificacao = (value: string, status: boolean) => {
        setItemProp((prev) => {
            const jaExiste = prev.classificacao?.some((c) => c.value === value)
            const classificacao = jaExiste
                ? prev.classificacao!.map((c) => c.value === value ? { ...c, status } : c)
                : [...(prev.classificacao ?? []), { value, status }]
            return { ...prev, classificacao };
        });
    };

    const opcoes = useMemo(
        () => (itemProp.eh_bebida ? CLASSIFICACOES_BEBIDA : CLASSIFICACOES_COMIDA),
        [itemProp.eh_bebida]
    );

    const isChecked = (value: string) => itemProp.classificacao?.find((c) => c.value === value)?.status ?? false;

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        uploadImagem(file);
    }

    async function uploadImagem(file: File) {
        setIsUploadingImage(true)
        const imagemAnterior = itemProp.imagem
        const formData = new FormData();
        formData.append('imagem', file);
        await axios.post(route('aplicacao.empresa.cardapios.categorias.item.store-imagem', {
            cnpj,
            cardapio_id,
            categoria_id: itemProp.categoria_id
        }), formData)
        .then((response) => {
            setItemProp(prev => ({
                ...prev,
                imagem: response.data.url
            }))
            // Só apaga a imagem anterior se ela mesma era uma troca ainda não
            // salva. A imagem original do item (já persistida) nunca é apagada
            // aqui — só depois que a edição for salva com sucesso.
            if (imagemAnterior && imagemAnterior !== imagemOriginal) {
                apagarImagemPendente(cnpj, cardapio_id, String(itemProp.categoria_id), imagemAnterior)
            }
        })
        .catch((error) => {
            toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
        })
        .finally(() => setIsUploadingImage(false))
    }

    function calcularDescontoPorNovoPreco(novoPreco: number) {
        const preco = itemProp.preco ?? 0;

        if (preco === 0) {
            toast.warning('Para calcular qualquer tipo de desconto, antes, adicione o preço unitário do item.');
            return;
        }

        if (Number.isNaN(novoPreco)) {
            setItemProp(prev => ({
                ...prev,
                valor_desconto: undefined,
                porcentagem_desconto: undefined
            }));
            return;
        }

        if (novoPreco < 0) {
            toast.warning('O novo preço do item deve ser maior ou igual a 0.');
            return
        }

        if (novoPreco > preco) {
            toast.warning('O novo preço do item deve ser menor que o preço unitário cadastrado.')
            return
        }

        const porcentagemDesconto = ((preco - novoPreco) / preco) * 100;

        setItemProp(prev => ({
            ...prev,
            valor_desconto: novoPreco,
            porcentagem_desconto: Number(porcentagemDesconto.toFixed(2))
        }));
    }

    function calcularDescontoPorPorcentagem(porcentagem: number) {
        const preco = itemProp.preco ?? 0;
        if (preco === 0) {
            toast.warning('Para calcular qualquer tipo de desconto, antes, adicione o preço unitário do item.');
            return;
        }

        if (Number.isNaN(porcentagem)) {
            setItemProp(prev => ({
                ...prev,
                valor_desconto: undefined,
                porcentagem_desconto: undefined
            }));
            return;
        }

        if (porcentagem < 0) {
            toast.warning('A porcentagem deve ser maior ou igual a 0%.')
            return
        }

        if (porcentagem > 100) {
            toast.warning('A porcentagem não pode ser maior que 100%.')
            return
        }

        const novoPreco = preco - (preco * porcentagem) / 100;

        setItemProp(prev => ({
            ...prev,
            porcentagem_desconto: porcentagem,
            valor_desconto: Number(novoPreco.toFixed(2))
        }));
    }

    function resetCopiaGrupoComplemento() {
        setHandleCategoriaParaCopiaGrupoComplemento(undefined)
        setHandleItemParaCopiaGrupoComplemento(undefined)
        setHandleCopiaComplemento(false)
    }

    async function consultaItensDeCategoria(categoria_id: number) {
        setLoadingItensPorCategoria(true)
        await axios.get(route('aplicacao.empresa.cardapios.categorias.itens.itens_por_categoria', {cnpj, cardapio_id, categoria_id}))
            .then((response) => {
                setItensCategoriaSelecionadaParaCopiaGrupoComplemento(response.data.map(function (item: TItem) {
                    return {value: String(item.id), label: item.nome ?? ''}
                }))
            })
            .finally(() => setLoadingItensPorCategoria(false))
    }

    async function copiaGrupoComplemento() {
        setLoadingCopiaGrupoComplemento(true)
        await axios.post(route('aplicacao.empresa.cardapios.categorias.item.copiaGrupoComplementos', {cnpj, cardapio_id, categoria_id: itemProp.categoria_id, item_id: itemProp.id}), {
            categoria_id: handleCategoriaParaCopiaGrupoComplemento,
            item_id: handleItemParaCopiaGrupoComplemento
        })
            .then(async (response) => {
                toast.success(response.data.mensagem)
                const itemAtualizado = await axios.get(route('aplicacao.empresa.cardapios.categorias.item.show', {cnpj, cardapio_id, categoria_id: itemProp.categoria_id, item_id: itemProp.id}))
                setItemProp(prev => ({ ...prev, grupo_complementos: itemAtualizado.data.item.grupo_complementos }))
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
            })
            .finally(() => {
                resetCopiaGrupoComplemento()
                setLoadingCopiaGrupoComplemento(false)
            })
    }

    useEffect(() => {
        if (handleCategoriaParaCopiaGrupoComplemento === undefined) return
        consultaItensDeCategoria(handleCategoriaParaCopiaGrupoComplemento)
    }, [handleCategoriaParaCopiaGrupoComplemento])

  return (
    <DrawerContent className="w-full p-6 lg:w-[55vw]">
      <Tabs defaultValue={'detalhes'} value={tab} onValueChange={(v) => setTab(v as TTab)} className="min-h-0 flex-1">
        <TabsList className='w-full'>
          {ITEM_NORMAL_TABS.filter(int => (isEditing && itemProp.categoria_tipo === 'I') || int.value !== 'complementos').map((int, intIdx) => (
          <TabsTrigger key={intIdx} value={int.value}>{int.label}</TabsTrigger>
        ))}
        </TabsList>
        <TabsContent value={'detalhes'} className="flex min-h-0 flex-col">
                <div className="flex-1 scroll-fade overflow-y-auto p-4">
                    <FieldGroup>
                        <div className="w-full">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="categoria_id">Categoria</FieldLabel>
                                    <Select
                                        id="categoria_id"
                                        name="categoria_id"
                                        items={categorias}
                                        value={categorias.find(categoria => categoria.value === String(itemProp.categoria_id))?.value}
                                        onValueChange={(e) => handleInputsItem(setItemProp, Number(e), 'categoria_id')}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Categorias</SelectLabel>
                                                {categorias.map((categoria) => (
                                                    <SelectItem key={categoria.value} value={categoria.value}>
                                                        {categoria.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <FieldGroup className="flex flex-col sm:grid sm:grid-cols-5 gap-4 w-full">
                                    <Field className="w-full sm:col-span-4">
                                        <FieldLabel htmlFor="nome">Nome do item</FieldLabel>
                                        <Input key={itemProp.nome} id="nome" name="nome" defaultValue={itemProp.nome ?? ''} onBlur={(e) => handleInputsItem(setItemProp, e.target.value, 'nome')}/>
                                    </Field>
                                    <Field className="w-full sm:col-span-1">
                                        <FieldLabel htmlFor="external_id">Código PDV.</FieldLabel>
                                        <Input key={itemProp.external_id} id="external_id" name="external_id" defaultValue={itemProp.external_id ?? ''} onBlur={(e) => handleInputsItem(setItemProp, e.target.value, 'external_id')}/>
                                    </Field>
                                </FieldGroup>
                            </FieldGroup>
                        </div>
                        <FieldGroup>
                            <div className="flex gap-4">
                                <label className="cursor-pointer">
                                    <Attachment state={isUploadingImage ? 'uploading' : 'idle'} orientation={'vertical'} className="size-52">
                                        <AttachmentMedia variant={'image'}>
                                            {isUploadingImage ? (
                                                <Spinner />
                                            ) : (
                                                <img className="h-full w-full object-cover" src={itemProp?.imagem ?? 'https://placehold.co/300'} alt="Imagem de item novo" />
                                            )}
                                        </AttachmentMedia>
                                    </Attachment>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                                <Field className="flex flex-1 flex-col">
                                    <FieldLabel>Descrição</FieldLabel>
                                    <Textarea
                                        key={itemProp.descricao}
                                        defaultValue={itemProp.descricao ?? ''}
                                        onBlur={(e) => handleInputsItem(setItemProp, e.target.value, 'descricao')}
                                        className="flex-1 resize-none"
                                    />
                                </Field>
                            </div>
                            <Field>
                                <div className="flex items-center justify-between">
                                    <FieldLabel htmlFor="dias_funcionamento">
                                        Dias de funcionamento
                                    </FieldLabel>
                                    <div className="flex gap-3 text-xs">
                                        <button
                                            type="button"
                                            className="text-primary hover:underline"
                                            onClick={() => handleInputsItem(setItemProp, DIAS_SEMANA, 'dias_funcionamento')}
                                        >
                                            Selecionar todos
                                        </button>
                                        <button
                                            type="button"
                                            className="text-muted-foreground hover:underline"
                                            onClick={() => handleInputsItem(setItemProp, [], 'dias_funcionamento')}
                                        >
                                            Remover todos
                                        </button>
                                    </div>
                                </div>
                                <Combobox
                                    id="dias_funcionamento"
                                    items={DIAS_SEMANA}
                                    multiple
                                    itemToStringValue={(item: TDiaSemana) =>
                                        item.label
                                    }
                                    value={DIAS_SEMANA.filter((ds) =>
                                        itemProp.dias_funcionamento?.includes(ds.value),
                                    )}
                                    onValueChange={(itens: TDiaSemana[]) =>
                                        handleInputsItem(setItemProp, itens, 'dias_funcionamento')
                                    }
                                >
                                    <ComboboxChips ref={diasFuncionamentoAnchor}>
                                        <ComboboxValue>
                                            {itemProp.dias_funcionamento?.map((df: string | number) => (
                                                <ComboboxChip key={df}>
                                                    {DIA_SEMANA(Number(df))}
                                                </ComboboxChip>
                                            ))}
                                            <ComboboxChipsInput />
                                        </ComboboxValue>
                                    </ComboboxChips>
                                    <ComboboxContent anchor={diasFuncionamentoAnchor}>
                                        <ComboboxEmpty>
                                            Não contêm dias a ser informado
                                        </ComboboxEmpty>
                                        <ComboboxList>
                                            {(item: TDiaSemana) => (
                                                <ComboboxItem
                                                    key={item.value}
                                                    value={item}
                                                >
                                                    {item.label}
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <p className="text-muted-foreground text-xs">
                                    Selecione os dias que o cardápio vai funcionar
                                </p>
                            </Field>
                            {itemProp.tipo === 'PRE' && (
                                <>
                                    <Alert>
                                        <AlertCircle />
                                        <AlertTitle>Empresário, atenção!</AlertTitle>
                                        <AlertDescription>Ajude seus clientes a entender o tamanho dos itens do seu cardápio.</AlertDescription>
                                    </Alert>
                                    <RadioGroup value={String(itemProp.qtde_pessoas ?? '')} onValueChange={(e) => handleInputsItem(setItemProp, Number(e), 'qtde_pessoas')}>
                                        <p className="text-lg font-bold md:text-xl">Pra qual tamanho de fome é esse item</p>
                                        <p className="text-base md:text-lg">Dê mais detalhes para que o cliente possa planejar a refeição.</p>
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                            {QTDE_PESSOAS_INFO.map((qtde, qtdeIdx) => (
                                                <Card key={qtdeIdx}>
                                                    <CardContent>
                                                        <Label
                                                            htmlFor={qtde.value}
                                                            className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                                                        >
                                                            <RadioGroupItem value={qtde.value} id={qtde.value} />
                                                            {qtde.icon}
                                                            {qtde.label}
                                                        </Label>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                    <Field>
                                        <FieldLabel htmlFor="peso">Peso</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput key={itemProp.peso} id="peso" name="peso" defaultValue={itemProp.peso ?? ''} onBlur={(e) => handleInputsItem(setItemProp, e.target.value, 'peso')}/>
                                            <InputGroupAddon align={'inline-end'}>
                                                <Select value={itemProp.gramagem ?? ''} onValueChange={(e) => handleInputsItem(setItemProp, e, 'gramagem')} items={GRAMAGEM_INFO}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Informe a gramagem"/>
                                                    </SelectTrigger>
                                                    <SelectContent align="end" sideOffset={8} alignOffset={-4}>
                                                        {GRAMAGEM_INFO.map(gramagem => (
                                                            <SelectItem key={gramagem.value} value={gramagem.value}>{gramagem.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Field>
                                </>
                            )}
                        </FieldGroup>
                    </FieldGroup>
                </div>
        </TabsContent>
        <TabsContent value={'preco_estoque'} className="flex min-h-0 flex-col">
            {itemProp.tipo === 'PIZ' ? (
                <div className="flex flex-col gap-4">
                    {itemProp.precos?.map((preco, precoIdx) => (
                        <PizzaPrecoCard
                            key={preco.tamanho_id ?? precoIdx}
                            preco={preco}
                            onChange={(patch) => atualizarPrecoPizza(precoIdx, patch)}
                        />
                    ))}
                </div>
            ) : (
                <>
                    {!itemProp.desconto ? (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-start gap-4 md:flex-row md:items-end">
                                <div className="w-full">
                                    <Field>
                                        <FieldLabel htmlFor="preco">
                                            Preço
                                        </FieldLabel>
                                        <InputGroup>
                                            <InputGroupAddon align={'inline-start'}>R$</InputGroupAddon>
                                            <InputGroupInput
                                                key={itemProp.preco}
                                                id="preco"
                                                defaultValue={itemProp.preco ?? ''}
                                                onBlur={(e) => handleInputsItem(setItemProp, Number(e.target.value), 'preco')}
                                            />
                                        </InputGroup>
                                    </Field>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => handleInputsItem(setItemProp, true, 'desconto')}
                                >
                                    Aplicar desconto
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="flex gap-2">
                                <p className="text-lg font-bold md:text-xl">Desconto direto no item</p>
                                <Button
                                    type="button"
                                    onClick={() => handleInputsItem(setItemProp, false, 'desconto')}
                                    variant={'destructive'}
                                >
                                    Remover desconto
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field>
                                    <FieldLabel htmlFor="preco">
                                        Preço
                                    </FieldLabel>
                                    <InputGroup>
                                        <InputGroupAddon align={'inline-start'}>R$</InputGroupAddon>
                                        <InputGroupInput
                                            disabled
                                            readOnly
                                            id="preco"
                                            value={itemProp.preco ?? ''}
                                        />
                                    </InputGroup>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="valor_desconto">Novo preço</FieldLabel>
                                    <InputGroup>
                                        <InputGroupAddon align={'inline-start'}>R$</InputGroupAddon>
                                        <InputGroupInput
                                            key={itemProp.valor_desconto}
                                            id="valor_desconto"
                                            defaultValue={itemProp.valor_desconto ?? ''}
                                            onBlur={(e) => calcularDescontoPorNovoPreco(Number(e.target.value))}
                                        />
                                    </InputGroup>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="porcentagem-desconto">Desconto em %</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            key={itemProp.porcentagem_desconto}
                                            id="porcentagem-desconto"
                                            defaultValue={itemProp.porcentagem_desconto ?? ''}
                                            onBlur={(e) => calcularDescontoPorPorcentagem(Number(e.target.value))}
                                        />
                                        <InputGroupAddon align={'inline-end'}>%</InputGroupAddon>
                                    </InputGroup>
                                </Field>
                            </div>
                        </div>
                    )}
                </>
            )}
        </TabsContent>
        {isEditing && itemProp.categoria_tipo === 'I' && (
            <TabsContent value={'complementos'} className='flex min-h-0 flex-col gap-4'>
                <div className="flex flex-col">
                    <H5>Complementos</H5>
                    <H6>Seu item tem complementos pra ficar ainda mais gostoso? Indique aqui.</H6>
                </div>
                {(itemProp.grupo_complementos?.length ?? 0) > 0 && (
                    <Card className="m-4">
                        <CardHeader>
                            <CardTitle>Grupos de complementos que compõem esse item</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {itemProp.grupo_complementos?.map((grupo) => {
                                const contagemComplementos = grupo.complementos?.length ?? 0
                                return  (
                                    <Card key={grupo.id}>
                                        <CardHeader>
                                            <CardTitle>{grupo.nome}</CardTitle>
                                            <CardDescription>{`${contagemComplementos} ${contagemComplementos == 1 ? 'opção' : 'opções'}`}</CardDescription>
                                            <CardAction>
                                                <Badge variant={grupo.obrigatoriedade ? 'default' : 'secondary'}>
                                                    {grupo.obrigatoriedade ? 'Obrigatório' : 'Opcional'}
                                                </Badge>
                                            </CardAction>
                                        </CardHeader>
                                        <CardContent>
                                                {(grupo.complementos ?? []).map(complemento => (
                                                    <div className="flex justify-between px-4" key={complemento.id}>
                                                        <p>{complemento.nome}</p>
                                                        <p><b>R$ {converteReal(complemento.preco)}</b></p>
                                                    </div>
                                                ))}
                                        </CardContent>
                                    </Card>
                                )
                            })}


                        </CardContent>
                    </Card>
                )}

                <div className="flex flex-col gap-4 sm:flex-row">
                    <Button variant={'outline'} onClick={() => onOpenDrawerGrupoComplemento(true)}>
                        {<Plus />}
                        Adicionar um complemento
                    </Button>
                    <Button variant={'outline'} onClick={() => setHandleCopiaComplemento(true)}>
                        {<Copy />}
                        Copiar complemento de outro item
                    </Button>
                </div>

                {handleCopiaComplemento && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Copiar grupo existente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="categorias_copia_grupo_complementos">Categorias:</FieldLabel>
                                    <Select
                                        defaultValue={handleCategoriaParaCopiaGrupoComplemento}
                                        onValueChange={(e) => setHandleCategoriaParaCopiaGrupoComplemento(e ?? undefined)}
                                        name="categorias_copia_grupo_complementos"
                                        id="categorias_copia_grupo_complementos"
                                        items={categorias}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma categoria..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {categorias.map(categoria => (
                                                    <SelectItem key={categoria.value} value={categoria.value}>{categoria.label}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                {loadingItensPorCategoria ? (
                                    <div className="flex w-full mx-auto">
                                        <p className="inline-flex gap-2"><Spinner />Carregando itens...</p>
                                    </div>
                                ) : (
                                    <>
                                        {handleCategoriaParaCopiaGrupoComplemento && (
                                            <Field>
                                                <FieldLabel htmlFor="item_copia_grupo_complementos">Selecione o item para copiar o grupo de complementos</FieldLabel>
                                                <Select
                                                    name="item_copia_grupo_complementos"
                                                    id="item_copia_grupo_complementos"
                                                    items={itensCategoriaSelecionadaParaCopiaGrupoComplemento}
                                                    value={itensCategoriaSelecionadaParaCopiaGrupoComplemento.find(item => item.value === String(handleItemParaCopiaGrupoComplemento))?.value}
                                                    defaultValue={undefined}
                                                    onValueChange={(e) => setHandleItemParaCopiaGrupoComplemento(e ? Number(e) : undefined)}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Selecione um item..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {itensCategoriaSelecionadaParaCopiaGrupoComplemento.map((item) => (
                                                                <SelectItem key={item.value} value={item.value}>
                                                                    {item.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                        )}
                                    </>
                                )}
                            </FieldGroup>
                        </CardContent>
                        <CardFooter className="justify-end gap-2">
                            <Button variant={'destructive'} onClick={() => resetCopiaGrupoComplemento()}>
                                Cancelar
                            </Button>
                            <Button onClick={() => copiaGrupoComplemento()} disabled={loadingCopiaGrupoComplemento}>
                                {loadingCopiaGrupoComplemento ? <Spinner /> : <Copy /> }
                                Copiar
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </TabsContent>
        )}
        <TabsContent value={'classificacao'} className="flex min-h-0 flex-col">
            <div className="flex flex-col gap-4">
                {!itemProp.eh_bebida ? (
                    <>
                        <p className="text-xl">Restrições alimentares:</p>
                        <p className="text-sm md:text-base">
                            Indique se seu item é adequado a restrições alimentares diversas para atrair a atenção de clientes.
                        </p>

                        <Alert className="my-4 text-sm md:text-base">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Lembre-se que você é responsável por todas as informações sobre os itens.</strong>
                            </AlertDescription>
                        </Alert>

                        {itemProp.tipo !== 'PIZ' && (
                            <div className="mb-4 flex h-auto flex-col items-center justify-between gap-4 rounded-lg border-4 border-solid border-primary px-4 md:h-24 md:flex-row">
                                <p className="text-base md:text-lg">Este item é uma bebida?</p>
                                <Switch
                                    checked={itemProp.eh_bebida}
                                    onCheckedChange={(checked) => setItemProp((prev) => ({ ...prev, eh_bebida: checked }))}
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-6">
                            {opcoes.map((option) => (
                                <ClassificacaoItem
                                    key={option.id}
                                    option={option}
                                    checked={isChecked(option.id)}
                                    onToggle={(status) => toggleClassificacao(option.id, status)}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-xl">Classificação da bebida:</p>
                        <p className="text-sm md:text-base">
                            Indique se sua bebida é adequada a restrições alimentares diversas para atrair a atenção de clientes.
                        </p>

                        <div className="my-4 flex h-auto flex-col items-center justify-between gap-4 rounded-lg border-4 border-solid border-primary px-4 md:h-24 md:flex-row">
                            <p className="text-base md:text-lg">Este item é uma bebida?</p>
                            <Switch
                                checked={itemProp.eh_bebida}
                                onCheckedChange={(checked) => setItemProp((prev) => ({ ...prev, eh_bebida: checked }))}
                            />
                        </div>

                        <div className="flex flex-col gap-6">
                            {CLASSIFICACOES_BEBIDA.map((option) => (
                                <ClassificacaoItem
                                    key={option.id}
                                    option={option}
                                    checked={isChecked(option.id)}
                                    onToggle={(status) => toggleClassificacao(option.id, status)}
                                />
                            ))}
                        </div>

                        <p className="mt-4 text-xl">Restrições:</p>
                        <p className="mb-4 text-sm md:text-base">
                            Indique se sua bebida possui algum ingrediente que seja uma restrição alimentar.
                        </p>

                        <div className="flex flex-col gap-6">
                            {RESTRICOES_BEBIDA.map((option) => (
                                <ClassificacaoItem
                                    key={option.id}
                                    option={option}
                                    checked={isChecked(option.id)}
                                    onToggle={(status) => toggleClassificacao(option.id, status)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </TabsContent>
      </Tabs>
        <DrawerFooter className="flex flex-row-reverse">
          <Button disabled={isSubmiting} onClick={() => {
            if (tab === 'detalhes') setTab('preco_estoque')
            if (tab === 'preco_estoque') setTab(isEditing && itemProp.categoria_tipo === 'I' ? 'complementos' : 'classificacao')
            if (tab === 'complementos') setTab('classificacao');
            if (tab === 'classificacao') {
                onSubmit().catch((error) => irParaAbaComErro(error?.response?.data?.errors))
            }
          }}>
            {
                tab === 'classificacao'
                ? (
                    <>
                        {!isEditing ? (
                            <>{isSubmiting ? (
                                <><Spinner /> Cadastrando...</>
                            ) : (
                                'Cadastrar'
                            )}</>
                        ) : (
                            <>{isSubmiting ? (
                                <><Spinner /> Salvando...</>
                            ) : (
                                'Salvar'
                            )}</>
                        )}
                    </>
                )
                : (<>Continuar</>)
            }
          </Button>
          <DrawerClose render={<Button variant={'destructive'} /> } disabled={isSubmiting}>Cancelar</DrawerClose>
        </DrawerFooter>
    </DrawerContent>
  )
}

// Drawer principal
export default function UpsertItemDrawer({
  open,
  onOpenChange,
  item: itemProp,
  categorias: categoriaProp,
  onSubmit,
  isSubmiting,
  onOpenDrawerGrupoComplemento,
  grupoComplementoAtualizadoEm
}: IProps) {
    // Constantes
    const isEdicao = itemProp?.id !== undefined
    const [item, setItem] = useState<TItem>(() => criarItemInicial(itemProp))
    const [imagemOriginal, setImagemOriginal] = useState<string | undefined>(() => itemProp?.imagem)
    const [categorias, setCategorias] = useState<TCategoria[]>(() => itemProp?.tipo === 'PIZ' ? criarCategoriasIniciais(categoriaProp, 'P') : criarCategoriasIniciais(categoriaProp, 'I'))
    const {cnpj, cardapio_id} = usePage<{
        cnpj: string,
        cardapio_id: string,
    }>().props

  // Recarrega/reseta o estado toda vez que o drawer é aberto
    useEffect(() => {
        if (!open) return
        setItem(criarItemInicial(itemProp))
        setImagemOriginal(itemProp?.imagem)
        setCategorias(itemProp?.tipo === 'PIZ' ? criarCategoriasIniciais(categoriaProp, 'P') : criarCategoriasIniciais(categoriaProp, 'I'))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

  // Grupo de complemento cadastrado no drawer filho (aberto por cima deste):
  // busca o item de novo pra refletir o grupo recém-criado na aba de complementos.
    useEffect(() => {
        if (!grupoComplementoAtualizadoEm || !item.id || !item.categoria_id) return
        axios.get(route('aplicacao.empresa.cardapios.categorias.item.show', {cnpj, cardapio_id, categoria_id: item.categoria_id, item_id: item.id}))
            .then((response) => {
                setItem(prev => ({ ...prev, grupo_complementos: response.data.item.grupo_complementos }))
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grupoComplementoAtualizadoEm])


  // Fechou sem finalizar o cadastro (Esc, clique fora, swipe, botão Cancelar):
  // só apaga a imagem se ela for diferente da original do item — a imagem
  // já persistida nunca é removida por aqui, senão edições canceladas
  // quebram a imagem do item.
    function handleOpenChange(value: boolean) {
        if (!value && item.imagem && item.imagem !== imagemOriginal) {
        apagarImagemPendente(cnpj, cardapio_id, String(item.categoria_id), item.imagem)
        }
        onOpenChange(value)
    }

    const SELECT_ITEM_TYPE_BUTTON: TBotoesSelecionarTipoItem[] = [
        {
            tipo: 'PRE',
            title: 'Preparado',
            description: 'Itens produzidos pela sua loja, como marmitas, bolos e lanches.',
            icon: <CookingPot className="size-10"/>
        },
        {
            tipo: 'BEB',
            title: 'Bebida Industrializada',
            description: 'Bebidas como: Refrigerantes, cervejas, energéticos e outros.',
            icon: <Beer className="size-10"/>
        },
        {
            tipo: 'IND',
            title: 'Industrializado',
            description: 'Itens industrializados, como salgadinhos e doces embalados.',
            icon: <ScanBarcode className="size-10"/>
        },
    ]

    function onSubmitCadastro() {
        return onSubmit(item)
    }

    function onSubmitEdicao() {
        return onSubmit(item)
    }

    return (
        <Drawer open={open} onOpenChange={handleOpenChange} swipeDirection="right">
            {item.categoria_tipo === 'I' && !item.tipo && (
                <DrawerContent className="w-full p-6 lg:w-[55vw]">
                    <DrawerHeader>
                    <DrawerTitle>Adicionar item</DrawerTitle>
                    <DrawerDescription>Selecione o tipo de item que você deseja adicionar ao cardápio:</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex flex-col gap-4 mt-4">
                    {SELECT_ITEM_TYPE_BUTTON.map((b, bIdx) => (
                        <Button
                        variant={"outline"}
                        type="button" key={bIdx}
                        className="flex h-24 w-full flex-nowrap justify-start gap-4 p-4"
                        onClick={() => setItem(prev => ({
                            ...prev,
                            tipo: b.tipo
                        }))}>
                            {b.icon}
                            <div className="flex flex-col items-start gap-2">
                            <H6 className="font-bold">{b.title}</H6>
                            <p className="w-full text-start text-base">{b.description}</p>
                            </div>
                        </Button>
                    ))}
                    </div>
                </DrawerContent>
            )}
            {['PRE', 'IND', 'BEB', 'PIZ'].includes(item.tipo!) && (
                <DrawerContentItemNormal
                    item={item}
                    setItem={setItem}
                    imagemOriginal={imagemOriginal}
                    cnpj={cnpj}
                    cardapio_id={cardapio_id}
                    categorias={categorias}
                    onSubmit={!isEdicao ? onSubmitCadastro : onSubmitEdicao}
                    isSubmiting={isSubmiting}
                    isEditing={isEdicao}
                    open={open}
                    onOpenDrawerGrupoComplemento={onOpenDrawerGrupoComplemento}
                />
            )}
        </Drawer>
    )
}
