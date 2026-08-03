import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Attachment, AttachmentContent, AttachmentMedia, AttachmentTitle } from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { H6 } from "@/components/utils/Heading";
import { ICategoria } from "@/types/empresa/cardapios/types";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { AlertCircle, Beer, ChevronDownIcon, CookingPot, ScanBarcode, User, Users, UsersRound } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

// Tipagens
interface IProps {
  open: boolean
  onOpenChange: (value: boolean) => void,
  item?: TItem,
  categorias: ICategoria[]
}
interface IItemBase {
  categoria_id?: number
  categoria_tipo?: 'I' | 'P'
  external_id?: number
  tipo?: 'PRE' | 'BEB' | 'IND' | 'PIZ'
  nome?: string
  tipo_preco?: 'preco_combo' | 'preco_item' | 'fixo'
  preco?: number
  desconto?: boolean
  valor_desconto?: number
  porcentagem_desconto?: number
  descricao?: string
  eh_bebida?: boolean
  classificacao?: string[],
  imagem?: string,
  dias_funcionamento?: (string | number)[]
}
interface IItemNormal {
  peso?: string | number,
  gramagem?: string,
  qtde_pessoas?: number
}
interface IItemPizza {
  precos?: TPrecoPizza[]
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

// Remove uma imagem ainda não vinculada a um item salvo (best-effort: se
// falhar aqui, a limpeza agendada no backend remove mais tarde).
async function apagarImagemPendente(cnpj: string, cardapio_id: string, url: string) {
  await axios.delete(route('aplicacao.empresa.cardapios.categorias.item.destroy-imagem', {
    cnpj,
    cardapio_id,
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

function criarItemInicial(
  base?: Partial<TItem> | null
): TItem {
  return {
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
    classificacao: base?.classificacao,
    imagem: base?.imagem,
    dias_funcionamento: base?.dias_funcionamento,
    peso: base?.peso,
    gramagem: base?.gramagem,
    qtde_pessoas: base?.qtde_pessoas,
    precos: base?.precos,
  }
}

function criarCategoriasIniciais(categorias: ICategoria[]): TCategoria[] {
    return categorias.map(function (categoria) {
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

// DrawerContent ItemNormal

function DrawerContentItemNormal({
  setItem,
  item,
  cnpj,
  cardapio_id,
  categorias
}: {
  item: TItem
  setItem: React.Dispatch<React.SetStateAction<TItem>>
  cnpj: string,
  cardapio_id: string
  categorias: TCategoria[]
}) {
  type TTab = 'detalhes' | 'preco_estoque' | 'classificacao';
  const ITEM_NORMAL_TABS = [
    {value: 'detalhes', label: 'Detalhes'},
    {value: 'preco_estoque', label: 'Preço e Estoque'},
    {value: 'classificacao', label: 'Classificação'},
  ] as const
  const [tab, setTab] = useState<TTab>('detalhes')
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false)
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadImagem(file);
  }

  async function uploadImagem(file: File) {
    setIsUploadingImage(true)
    const imagemAnterior = item.imagem
    const formData = new FormData();
    formData.append('imagem', file);
    await axios.post(route('aplicacao.empresa.cardapios.categorias.item.store-imagem', {
      cnpj,
      cardapio_id,
    }), formData)
      .then((response) => {
        setItem(prev => ({
          ...prev,
          imagem: response.data.url
        }))
        // Troca de imagem: a anterior nunca foi vinculada a um item salvo, então some.
        if (imagemAnterior) {
          apagarImagemPendente(cnpj, cardapio_id, imagemAnterior)
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message)
      })
      .finally(() => setIsUploadingImage(false))
  }

  function setTabCadastroItemPreparado(tab: TTab) {
    setTab(tab)
  }

function calcularDescontoPorNovoPreco(novoPreco: number) {
    const preco = item.preco ?? 0;

    if (preco === 0) {
        toast.warning('Para calcular qualquer tipo de desconto, antes, adicione o preço unitário do item.');
        return;
    }

    if (Number.isNaN(novoPreco)) {
        setItem(prev => ({
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

    setItem(prev => ({
        ...prev,
        valor_desconto: novoPreco,
        porcentagem_desconto: Number(porcentagemDesconto.toFixed(2))
    }));
}

function calcularDescontoPorPorcentagem(porcentagem: number) {
    const preco = item.preco ?? 0;

    if (preco === 0) {
        toast.warning('Para calcular qualquer tipo de desconto, antes, adicione o preço unitário do item.');
        return;
    }

    if (Number.isNaN(porcentagem)) {
        setItem(prev => ({
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

    setItem(prev => ({
        ...prev,
        porcentagem_desconto: porcentagem,
        valor_desconto: Number(novoPreco.toFixed(2))
    }));
}

  return (
    <DrawerContent className="w-full p-6 lg:w-[55vw]">
      <Tabs defaultValue={'detalhes'} value={tab} onValueChange={(v) => setTab(v as TTab)} className="min-h-0 flex-1">
        <TabsList className='w-full'>
          {ITEM_NORMAL_TABS.map((int, intIdx) => (
          <TabsTrigger key={intIdx} value={int.value}>{int.label}</TabsTrigger>
        ))}
        </TabsList>
        <TabsContent value={'detalhes'} className="flex min-h-0 flex-col">
            <div className="flex-1 scroll-fade overflow-y-auto p-4">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                    <label className="cursor-pointer">
                    <Attachment state={isUploadingImage ? 'uploading' : 'idle'} orientation={'vertical'} className="size-75">
                        <AttachmentMedia variant={'image'}>
                        {isUploadingImage ? (
                            <Spinner />
                        ) : (
                            <img className="h-full w-full object-cover" src={item?.imagem ?? 'https://placehold.co/300'} alt="Imagem de item novo" />
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
                    <div className="w-full">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="categoria_id">Categoria</FieldLabel>
                                <Select
                                    id="categoria_id"
                                    name="categoria_id"
                                    items={categorias}
                                    value={categorias.find(categoria => categoria.value === String(item.categoria_id))?.value}
                                    onValueChange={(e) => handleInputsItem(setItem, e, 'categoria_id')}>
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
                            <Field>
                                <FieldLabel htmlFor="nome">Nome do item</FieldLabel>
                                <Input id="nome" name="nome" value={item.nome ?? ''} onBlur={(e) => handleInputsItem(setItem, e, 'external_id')}/>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="external_id">Código PDV.</FieldLabel>
                                <Input id="external_id" name="external_id" value={item.external_id ?? ''} onBlur={(e) => handleInputsItem(setItem, e, 'external_id')}/>
                            </Field>
                        </FieldGroup>
                    </div>
                </div>
                <FieldGroup>
                    <Field>
                        <FieldLabel>Descrição</FieldLabel>
                        <Textarea rows={5} defaultValue={item.descricao ?? ''} onBlur={(e) => handleInputsItem(setItem, e, 'descricao')}/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="dias_funcionamento">
                            Dias de funcionamento
                        </FieldLabel>
                        <Combobox
                            id="dias_funcionamento"
                            items={DIAS_SEMANA}
                            multiple
                            itemToStringValue={(item: TDiaSemana) =>
                                item.label
                            }
                            value={DIAS_SEMANA.filter((ds) =>
                                item.dias_funcionamento?.includes(ds.value),
                            )}
                            onValueChange={(itens: TDiaSemana[]) =>
                                handleInputsItem(setItem, itens, 'dias_funcionamento')
                            }
                        >
                            <ComboboxChips ref={diasFuncionamentoAnchor}>
                                <ComboboxValue>
                                    {item.dias_funcionamento?.map((df) => (
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
                    {item.tipo === 'PRE' && (
                        <>
                            <Alert>
                                <AlertCircle />
                                <AlertTitle>Empresário, atenção!</AlertTitle>
                                <AlertDescription>Ajude seus clientes a entender o tamanho dos itens do seu cardápio.</AlertDescription>
                            </Alert>
                            <RadioGroup value={String(item.qtde_pessoas ?? '')} onValueChange={(e) => handleInputsItem(setItem, Number(e), 'qtde_pessoas')}>
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
                                    <InputGroupInput id="peso" name="peso" value={item.peso ?? ''} onBlur={(e) => handleInputsItem(setItem, e, 'peso')}/>
                                    <InputGroupAddon align={'inline-end'}>
                                        <Select value={item.gramagem ?? ''} onValueChange={(e) => handleInputsItem(setItem, e, 'gramagem')} items={GRAMAGEM_INFO}>
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
            </div>
        </TabsContent>
        <TabsContent value={'preco_estoque'} className="flex min-h-0 flex-col">
            {!item.desconto ? (
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
                                        id="preco"
                                        value={item.preco ?? ''}
                                        onChange={(e) => handleInputsItem(setItem, Number(e.currentTarget.value), 'preco')}
                                    />
                                </InputGroup>
                            </Field>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => handleInputsItem(setItem, true, 'desconto')}
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
                            onClick={() => handleInputsItem(setItem, false, 'desconto')}
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
                                    value={item.preco ?? ''}
                                />
                            </InputGroup>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="valor_desconto">Novo preço</FieldLabel>
                            <InputGroup>
                                <InputGroupAddon align={'inline-start'}>R$</InputGroupAddon>
                                <InputGroupInput
                                    id="valor_desconto"
                                    value={item.valor_desconto ?? ''}
                                    onChange={(e) => calcularDescontoPorNovoPreco(Number(e.currentTarget.value))}
                                />
                            </InputGroup>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="porcentagem-desconto">Desconto em %</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="porcentagem-desconto"
                                    value={item.porcentagem_desconto ?? ''}
                                    onChange={(e) => calcularDescontoPorPorcentagem(Number(e.currentTarget.value))}
                                />
                                <InputGroupAddon align={'inline-end'}>%</InputGroupAddon>
                            </InputGroup>
                        </Field>
                    </div>
                </div>
            )}
        </TabsContent>
        <TabsContent value={'classificacao'}></TabsContent>
      </Tabs>
        <DrawerFooter className="flex flex-row-reverse">
          <Button onClick={() => {
            if (tab === 'detalhes') setTab('preco_estoque')
            if (tab === 'preco_estoque') setTab('classificacao')
            if (tab === 'classificacao') () => {}
          }}>Continuar</Button>
          <DrawerClose render={<Button variant={'destructive'} />}>Cancelar</DrawerClose>
        </DrawerFooter>
    </DrawerContent>
  )
}

// Drawer principal
export default function UpsertItemDrawer({
  open,
  onOpenChange,
  item: itemProp,
  categorias: categoriaProp
}: IProps) {
  // Constantes
  const [item, setItem] = useState<TItem>(() => criarItemInicial(itemProp))
  const [categorias, setCategorias] = useState<TCategoria[]>(() => criarCategoriasIniciais(categoriaProp))
  const {cnpj, cardapio_id} = usePage<{
    cnpj: string,
    cardapio_id: string,
  }>().props

  // Recarrega/reseta o estado toda vez que o drawer é aberto
  useEffect(() => {
    if (open) {
      setItem(criarItemInicial(itemProp))
      setCategorias(criarCategoriasIniciais(categoriaProp))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Fechou sem finalizar o cadastro (Esc, clique fora, swipe, botão Cancelar):
  // a imagem enviada ainda não está vinculada a nenhum item, então remove.
  function handleOpenChange(value: boolean) {
    if (!value && item.imagem) {
      apagarImagemPendente(cnpj, cardapio_id, item.imagem)
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
      {['PRE', 'IND', 'BEB'].includes(item.tipo!) && (
        <DrawerContentItemNormal
          item={item}
          setItem={setItem}
          cnpj={cnpj}
          cardapio_id={cardapio_id}
          categorias={categorias}
        />
      )}
    </Drawer>
  )
}
