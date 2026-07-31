import { Attachment, AttachmentContent, AttachmentMedia, AttachmentTitle } from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { H6 } from "@/components/utils/Heading";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { Beer, CookingPot, ScanBarcode } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

// Tipagens
interface IProps {
  open: boolean
  onOpenChange: (value: boolean) => void,
  item?: TItem,

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

type TBotoesSelecionarTipoItem = {
  tipo: 'PRE' | 'BEB' | 'IND',
  title: string,
  description: string,
  icon: ReactNode
}

// Constantes

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

// DrawerContent ItemNormal

function DrawerContentItemNormal({
  setItem,
  item,
  cnpj,
  cardapio_id
}: {
  item: TItem
  setItem: React.Dispatch<React.SetStateAction<TItem>>
  cnpj: string,
  cardapio_id: string
}) {
  type TTab = 'detalhes' | 'preco_estoque' | 'classificacao';
  const ITEM_NORMAL_TABS = [
    {value: 'detalhes', label: 'Detalhes'},
    {value: 'preco_estoque', label: 'Preço e Estoque'},
    {value: 'classificacao', label: 'Classificação'},
  ] as const
  const [tab, setTab] = useState<TTab>('detalhes')
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false)
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadImagem(file);
  }
  async function uploadImagem(file: File) {
    setIsUploadingImage(true)
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
      })
      .catch((error) => {
        toast.error(error.response.data.message)
      })
      .finally(() => setIsUploadingImage(false))
  }
  return (
    <DrawerContent className="w-full p-6 lg:w-[55vw]">
      <Tabs defaultValue={'detalhes'} value={tab} onValueChange={(v) => setTab(v as TTab)}>
        <TabsList className='w-full'>
          {ITEM_NORMAL_TABS.map((int, intIdx) => (
          <TabsTrigger key={intIdx} value={int.value}>{int.label}</TabsTrigger>
        ))}
        </TabsList>
        <TabsContent value={'detalhes'}>
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
          </div>
        </div>
        </TabsContent>
        <TabsContent value={'preco_estoque'}></TabsContent>
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
}: IProps) {
  // Constantes
  const [item, setItem] = useState<TItem>(() => criarItemInicial(itemProp))
  const {cnpj, cardapio_id} = usePage<{
    cnpj: string,
    cardapio_id: string,
  }>().props

  // Recarrega/reseta o estado toda vez que o drawer é aberto
  useEffect(() => {
    if (open) {
      setItem(criarItemInicial(itemProp))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

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
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
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
      {item.tipo === 'PRE' && (
        <DrawerContentItemNormal 
          item={item}
          setItem={setItem}
          cnpj={cnpj}
          cardapio_id={cardapio_id}
        />
      )}
    </Drawer>
  )
}