import { useEffect, useState } from "react";
import axios from "axios";
import { router, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import BuscaSelecaoPaginada, { IComplementoBuscaSelecionavel, IRespostaPaginada } from "@/components/utils/BuscaSelecaoPaginada";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Link, Salad, CircleQuestionMark, ShoppingBag, Utensils, X, Minus, GripVertical, Images, Trash2, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Steps } from "@/components/ui/steps";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Attachment, AttachmentMedia } from "@/components/ui/attachment";
import { Spinner } from "@/components/ui/spinner";

type TModoCriacaoGrupo = "criar" | "copiar";
type TModoCriacaoComplemento = "criar" | "copiar";
type TTipoGrupoComplemento = "ingredientes" | "especificacoes" | "descartaveis" | "cross-sell";

interface IGrupoComplemento {
    nome?: string
    obrigatoriedade: boolean
    qtd_minima: number
    qtd_maxima: number
    complementos: IComplemento[]
}

type TComplementoParaCopiar = IComplementoBuscaSelecionavel & {
    preco: number
    external_id?: number
}

interface IComplemento {
    nome?: string
    imagem?: string
    descricao?: string
    preco: number
    status: boolean
    external_id?: string
}

const OPCOES_CRIACAO_GRUPO: {
    value: TModoCriacaoGrupo;
    icon: React.ReactNode;
    title: string;
    badge?: string;
    description: string;
}[] = [
    {
        value: "criar",
        icon: <Plus className="size-4" />,
        title: "Criar novo grupo",
        description: "Você cria um grupo novo, definindo informações gerais e quais serão os complementos",
    },
    {
        value: "copiar",
        icon: <Link className="size-4" />,
        title: "Copiar grupo",
        badge: "mais prático",
        description: "Você reaproveita um grupo que já possui em seu cardápio e a gestão fica mais fácil!",
    },
];

const OPCOES_CRIACAO_COMPLEMENTO: {
    value: TModoCriacaoGrupo;
    icon: React.ReactNode;
    title: string;
    badge?: string;
    description: string;
}[] = [
    {
        value: "criar",
        icon: <Plus className="size-4" />,
        title: "Criar novo complemento",
        description: "Você cria um complemento novo.",
    },
    {
        value: "copiar",
        icon: <Link className="size-4" />,
        title: "Copiar complemento",
        badge: "mais prático",
        description: "Você reaproveita um complemento que já possui em seu cardápio e a gestão fica mais fácil!",
    },
];

const OPCOES_TIPO_GRUPO_COMPLEMENTO: {
    value: TTipoGrupoComplemento;
    icon: React.ReactNode;
    title: string;
    exemplo: string;
    description: string;
}[] = [
    {
        value: "ingredientes",
        icon: <Salad className="size-4" />,
        title: "Ingredientes",
        exemplo: `Exemplos: "Escolha o tipo de pão do seu hambúrguer", "Turbine seu lanche".`,
        description: "Dê a opção do cliente remover e adicionar ingredientes neste produto, ou também escolher entre um grupo de opções.",
    },
    {
        value: "especificacoes",
        icon: <CircleQuestionMark className="size-4" />,
        title: "Especificações",
        description: "Faça perguntas para que o cliente defina melhor o produto e seu modo de preparo.",
        exemplo: `Exemplos: "Qual o tamanho do açaí?", "Qual o ponto da carne?"`
    },
    {
        value: "cross-sell",
        icon: <ShoppingBag className="size-4" />,
        title: "Especificações",
        description: "Aproveite para sugerir outros produtos e aumentar o valor do pedido.",
        exemplo: `Exemplos: "Que tal uma sobremesa?", "Que tal uma bebida?"`
    },
    {
        value: "descartaveis",
        icon: <Utensils className="size-4" />,
        title: "Descartáveis",
        description: "Ao invés de enviar por padrão, economize e ajude o meio ambiente perguntando ao cliente se ele precisa de talheres plásticos, sachês ou embalagens específicas.",
        exemplo: `Exemplos: "Deseja descartáveis?"`
    },
];

const OPCOES_OBRIGATORIEDADE = [
    {value: true, label: 'Obrigatório'},
    {value: false, label: 'Opcional'},
] as const

interface IProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    categoria_id?: number;
    item_id?: number;
    onSalvar?: () => void;
}

export default function UpsertComplementoDrawer({ open, setOpen, categoria_id, item_id, onSalvar }: IProps) {
    const { cnpj, cardapio_id } = usePage<{
        cnpj: string;
        cardapio_id: string;
    }>().props;

    const [modoCriacaoGrupo, setModoCriacaoGrupo] = useState<
        TModoCriacaoGrupo | undefined
    >(undefined);
    const [modoCriacaoGrupoTemp, setModoCriacaoGrupoTemp] = useState<
        TModoCriacaoGrupo | ""
    >("");

    const [tipoGrupoComplemento, setTipoGrupoComplemento] = useState<
        TTipoGrupoComplemento | undefined
    >(undefined);
    const [tipoGrupoComplementoTemp, setTipoGrupoComplementoTemp] = useState<
        TTipoGrupoComplemento | ""
    >("");

    const [modoCriacaoComplemento, setModoCriacaoComplemento] = useState<
        TModoCriacaoComplemento | undefined
    >(undefined);


    const [grupoComplemento, setGrupoComplemento] = useState<Partial<IGrupoComplemento>>()

    const [complementosParaCopiar, setComplementosParaCopiar] = useState<TComplementoParaCopiar[]>([])

    const [complemento, setComplemento] = useState<Partial<IComplemento>>()

    const [contagemSteps, setContagemSteps] = useState<number>(1)

    const [salvando, setSalvando] = useState<boolean>(false)

    const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false)

    const resetComponent = () => {
        setModoCriacaoGrupo(undefined);
        setModoCriacaoGrupoTemp("");
        setTipoGrupoComplemento(undefined);
        setTipoGrupoComplementoTemp("");
        setGrupoComplemento(undefined);
        setModoCriacaoComplemento(undefined)
        setComplementosParaCopiar([])
        setComplemento(undefined)
        setContagemSteps(1);
    };

    async function buscaComplementosParaCopia({ busca, page }: { busca: string; page: number }): Promise<IRespostaPaginada<IComplementoBuscaSelecionavel>> {
        if (!categoria_id || !item_id) {
            return { data: [], current_page: 1, last_page: 1 }
        }

        const resposta = await axios.get(
            route('aplicacao.empresa.cardapios.categorias.item.buscaComplementosParaCopia', {
                cnpj,
                cardapio_id,
                categoria_id,
                item_id,
            }),
            { params: { busca, page } }
        )

        return resposta.data.complementos
    }

    function adicionaComplementosParaCopiar(itens: IComplementoBuscaSelecionavel[]) {
        setComplementosParaCopiar(prev => {
            const idsExistentes = prev.map(c => c.id)
            const novos = itens
                .filter(item => !idsExistentes.includes(item.id))
                .map(item => ({ ...item, preco: 0, external_id: undefined }))

            return [...prev, ...novos]
        })
        setModoCriacaoComplemento(undefined)
    }

    function removeComplementoParaCopiar(id: number) {
        setComplementosParaCopiar(prev => prev.filter(c => c.id !== id))
    }

    // Complemento criado manualmente não tem id no banco ainda — usa um id
    // sintético negativo (nunca colide com ids reais) só pra entrar na mesma
    // lista/tabela usada pelos complementos copiados.
    function adicionaComplementoCriado() {
        if (!complemento?.nome) return

        setComplementosParaCopiar(prev => [
            ...prev,
            {
                id: -Date.now(),
                nome: complemento.nome!,
                descricao: complemento.descricao,
                imagem: complemento.imagem,
                preco: complemento.preco ?? 0,
                external_id: complemento.external_id ? Number(complemento.external_id) : undefined,
            },
        ])
        setComplemento(undefined)
        setModoCriacaoComplemento(undefined)
    }

    async function salvarGrupoComplemento() {
        if (!categoria_id || !item_id || !grupoComplemento) return

        setSalvando(true)
        await axios.post(
            route('aplicacao.empresa.cardapios.categorias.item.storeGrupoComplemento', {
                cnpj,
                cardapio_id,
                categoria_id,
                item_id,
            }),
            {
                nome: grupoComplemento.nome,
                obrigatoriedade: grupoComplemento.obrigatoriedade,
                qtd_minima: grupoComplemento.qtd_minima,
                qtd_maxima: grupoComplemento.qtd_maxima,
                complementos: complementosParaCopiar.map((complemento) => ({
                    nome: complemento.nome,
                    imagem: complemento.imagem ?? null,
                    descricao: complemento.descricao ?? '',
                    preco: complemento.preco,
                    external_id: complemento.external_id,
                    status: true,
                })),
            },
        )
            .then(() => {
                toast.success('Grupo de complemento cadastrado com sucesso.')
                setOpen(false)
                router.reload({ only: ['categorias', 'categoriaStatus'] })
                onSalvar?.()
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
            })
            .finally(() => setSalvando(false))
    }

    function atualizaComplementoParaCopiar(id: number, dados: Partial<Pick<TComplementoParaCopiar, 'preco' | 'external_id'>>) {
        setComplementosParaCopiar(prev => prev.map(c => c.id === id ? { ...c, ...dados } : c))
    }

    useEffect(() => {
        if (open) return

        // Fechou sem finalizar o cadastro: se uma imagem já tinha sido
        // enviada para o complemento em criação, ela nunca chegou a ser
        // vinculada a um complemento salvo — apaga pra não ficar órfã.
        if (complemento?.imagem) {
            apagarImagemPendente(complemento.imagem)
        }

        resetComponent()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    function criaGrupoComplementoBase(grupo_complemento: IGrupoComplemento) {
        setGrupoComplemento(prev => ({
            ...prev,
            ...grupo_complemento,
            complementos: [
                ...(prev?.complementos ?? []),
                {
                    nome: '',
                    descricao: '',
                    preco: 0,
                    status: false,
                    external_id: undefined,
                },
            ],
        }))
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        uploadImagem(file);
    }

    async function apagarImagemPendente(url: string) {
        if (!categoria_id) return

        await axios.delete(route('aplicacao.empresa.cardapios.categorias.item.destroy-imagem', {
            cnpj,
            cardapio_id,
            categoria_id,
        }), { data: { url } }).catch(() => {})
    }

    async function uploadImagem(file: File) {
        if (!categoria_id) return

        setIsUploadingImage(true)
        const imagemAnterior = complemento?.imagem
        const formData = new FormData();
        formData.append('imagem', file);
        await axios.post(route('aplicacao.empresa.cardapios.categorias.item.store-imagem', {
            cnpj,
            cardapio_id,
            categoria_id,
        }), formData)
        .then((response) => {
            setComplemento(prev => ({
                ...prev,
                imagem: response.data.url
            }))
            // Só apaga a imagem anterior se ela mesma ainda não tinha sido
            // vinculada a um complemento salvo (troca de imagem antes de salvar).
            if (imagemAnterior) {
                apagarImagemPendente(imagemAnterior)
            }
        })
        .catch((error) => {
            toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
        })
        .finally(() => setIsUploadingImage(false))
    }

    useEffect(() => {
        if (contagemSteps !== 2) return

        criaGrupoComplementoBase({
            obrigatoriedade: false,
            qtd_minima: 0,
            qtd_maxima: 1,
            complementos: [],
        })
    }, [contagemSteps])



    return (
        <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
            <DrawerContent className="w-full p-6 lg:w-[55vw]">
                {modoCriacaoGrupo === undefined && (
                        <>
                            <DrawerHeader>
                                <DrawerTitle>Novo grupo de complementos</DrawerTitle>
                                <DrawerDescription>
                                    Crie um grupo e adicione os complementos que ele vai
                                    oferecer, como opções extras, acompanhamentos ou
                                    variações do item.
                                </DrawerDescription>
                            </DrawerHeader>
                            <RadioGroup
                                value={modoCriacaoGrupoTemp}
                                onValueChange={(value) => setModoCriacaoGrupoTemp(value as TModoCriacaoGrupo)}
                                className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2"
                            >
                                {OPCOES_CRIACAO_GRUPO.map((opcao) => (
                                    <Label key={opcao.value} htmlFor={`modo_criacao_grupo_${opcao.value}`} >
                                        <Card
                                            className={cn(
                                                "cursor-pointer transition-shadow",
                                                modoCriacaoGrupoTemp === opcao.value && "ring-2 ring-primary",
                                            )}
                                        >
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    {opcao.icon}
                                                    {opcao.title}
                                                    {opcao.badge && <Badge variant="secondary">{opcao.badge}</Badge>}
                                                </CardTitle>
                                                <CardAction>
                                                    <RadioGroupItem value={opcao.value} id={`modo_criacao_grupo_${opcao.value}`} />
                                                </CardAction>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">{opcao.description}</p>
                                            </CardContent>
                                        </Card>
                                    </Label>
                                ))}
                            </RadioGroup>
                            <DrawerFooter className="flex flex-row justify-end gap-2">
                                <DrawerClose render={<Button variant={'destructive'} />}>
                                    Cancelar
                                </DrawerClose>
                                <Button onClick={() => setModoCriacaoGrupo(modoCriacaoGrupoTemp || undefined)}>Continuar</Button>
                            </DrawerFooter>
                        </>
                )}
                {modoCriacaoGrupo === 'criar' && (
                    <>
                        <DrawerHeader className="flex-row items-center justify-between p-0 pb-4">
                            <DrawerTitle>Criar novo grupo</DrawerTitle>
                        </DrawerHeader>
                        <Steps totalSteps={3} currentStep={contagemSteps} />

                        {contagemSteps === 1 && (
                            <>
                                <RadioGroup
                                    value={tipoGrupoComplementoTemp}
                                    onValueChange={(value) => setTipoGrupoComplementoTemp(value as TTipoGrupoComplemento)}
                                    className="flex flex-col gap-4 p-4 w-full"
                                >
                                    {OPCOES_TIPO_GRUPO_COMPLEMENTO.map((opcao) => (
                                        <Label key={opcao.value} htmlFor={`tipo_grupo_complemento_${opcao.value}`} >
                                            <Card
                                                className={cn(
                                                    "cursor-pointer transition-shadow w-full",
                                                    tipoGrupoComplementoTemp === opcao.value && "ring-2 ring-primary",
                                                )}
                                            >
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        {opcao.icon}
                                                        {opcao.title}
                                                    </CardTitle>
                                                    <CardAction>
                                                        <RadioGroupItem value={opcao.value} id={`tipo_grupo_complemento_${opcao.value}`} />
                                                    </CardAction>
                                                </CardHeader>
                                                <CardContent className="flex flex-col gap-2">
                                                    <p className="text-sm text-muted-foreground">{opcao.description}</p>
                                                    {opcao.exemplo && tipoGrupoComplementoTemp === opcao.value && (
                                                        <Alert className="bg-muted/50">
                                                            <AlertTitle>{opcao.exemplo}</AlertTitle>
                                                        </Alert>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Label>
                                    ))}
                                </RadioGroup>
                                <DrawerFooter className="flex flex-row justify-end gap-2">
                                    <DrawerClose render={<Button variant={'destructive'} />}>
                                        Cancelar
                                    </DrawerClose>
                                    <Button onClick={() => {
                                        setTipoGrupoComplemento(tipoGrupoComplementoTemp || undefined)
                                        setContagemSteps(contagemSteps + 1)
                                    }}>Continuar</Button>
                                </DrawerFooter>
                            </>
                        )}

                        {contagemSteps === 2 && (
                           <>
                                <DrawerTitle>Primeiro, defina o grupo e suas informações principais.</DrawerTitle>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="grupo_complemento_nome">Nome do grupo</FieldLabel>
                                        <Input
                                            id="grupo_complemento_nome"
                                            name="grupo_complemento_nome"
                                            placeholder="Ex: Turbine seu lanche"
                                            value={grupoComplemento?.nome ?? ""}
                                            onInput={(e) => {
                                                const value = e.currentTarget.value
                                                setGrupoComplemento(prev => ({
                                                    ...prev!,
                                                    nome: value
                                                }))
                                            }}
                                        />
                                    </Field>
                                    <FieldGroup className="md:grid md:grid-cols-2">
                                        <Field>
                                            <Label htmlFor="grupo_complemento_obrigatoriedade">Este grupo é obrigatório ou opcional?</Label>
                                            <Select
                                                id="grupo_complemento_obrigatoriedade"
                                                name="grupo_complemento_obrigatoriedade"
                                                items={OPCOES_OBRIGATORIEDADE}
                                                value={grupoComplemento?.obrigatoriedade ?? false}
                                                onValueChange={(e) => setGrupoComplemento(prev => ({
                                                    ...prev!,
                                                    obrigatoriedade: e as boolean
                                                }))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {OPCOES_OBRIGATORIEDADE.map((opcao, opcaoIdx) => (
                                                        <SelectItem key={opcaoIdx} value={opcao.value}>{opcao.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <FieldGroup className="md:grid md:grid-cols-2">
                                            <Field>
                                                <Label htmlFor="grupo_complemento_qtd_minima">Qtd. mínima</Label>
                                                <InputGroup>
                                                    <InputGroupButton onClick={() => setGrupoComplemento(prev => ({
                                                        ...prev!,
                                                        qtd_minima: Math.max(0, (prev?.qtd_minima ?? 0) - 1)
                                                    }))}><Minus/></InputGroupButton>
                                                    <InputGroupInput
                                                        id="grupo_complemento_qtd_minima"
                                                        name="grupo_complemento_qtd_minima"
                                                        className="text-center"
                                                        value={grupoComplemento?.qtd_minima ?? 0}
                                                        type="number"
                                                        readOnly
                                                    />
                                                    <InputGroupButton onClick={() => setGrupoComplemento(prev => ({
                                                        ...prev!,
                                                        qtd_minima: (prev?.qtd_minima ?? 0) + 1
                                                    }))}><Plus/></InputGroupButton>
                                                </InputGroup>
                                            </Field>
                                            <Field>
                                                <Label htmlFor="grupo_complemento_qtd_maxima">Qtd. máxima</Label>
                                                <InputGroup>
                                                    <InputGroupButton onClick={() => setGrupoComplemento(prev => ({
                                                        ...prev!,
                                                        qtd_maxima: Math.max(1, (prev?.qtd_maxima ?? 0) - 1)
                                                    }))}><Minus/></InputGroupButton>
                                                    <InputGroupInput
                                                        id="grupo_complemento_qtd_maxima"
                                                        name="grupo_complemento_qtd_maxima"
                                                        className="text-center"
                                                        value={grupoComplemento?.qtd_maxima ?? 0}
                                                        type="number"
                                                        readOnly
                                                    />
                                                    <InputGroupButton onClick={() => setGrupoComplemento(prev => ({
                                                        ...prev!,
                                                        qtd_maxima: (prev?.qtd_maxima ?? 0) + 1
                                                    }))}><Plus/></InputGroupButton>
                                                </InputGroup>
                                            </Field>
                                        </FieldGroup>
                                    </FieldGroup>
                                </FieldGroup>
                                <DrawerFooter className="flex-row justify-end gap2">
                                    <Button variant={'destructive'} onClick={() => setContagemSteps(1)}>Voltar</Button>
                                    <Button onClick={() => setContagemSteps(3)} >Continuar</Button>
                                </DrawerFooter>
                           </>
                        )}

                        {contagemSteps === 3 && (
                            <>
                                {['ingredientes', 'cross-sell'].includes(tipoGrupoComplemento!) && modoCriacaoComplemento === undefined && (
                                    <>
                                        <DrawerTitle>Agora, adicione complementos ao grupo {grupoComplemento?.nome}</DrawerTitle>
                                        <RadioGroup
                                            value={modoCriacaoComplemento}
                                            onValueChange={(value) => setModoCriacaoComplemento(value as TModoCriacaoGrupo)}
                                            className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2"
                                        >
                                            {OPCOES_CRIACAO_COMPLEMENTO.map((opcao) => (
                                                <Label key={opcao.value} htmlFor={`modo_criacao_complemento_${opcao.value}`} >
                                                    <Card
                                                        className={cn(
                                                            "cursor-pointer transition-shadow w-full h-full",
                                                            modoCriacaoComplemento === opcao.value && "ring-2 ring-primary",
                                                        )}
                                                    >
                                                        <CardHeader>
                                                            <CardTitle className="flex items-center gap-2">
                                                                {opcao.icon}
                                                                {opcao.title}
                                                                {opcao.badge && <Badge variant="secondary">{opcao.badge}</Badge>}
                                                            </CardTitle>
                                                            <CardAction>
                                                                <RadioGroupItem value={opcao.value} id={`modo_criacao_complemento_${opcao.value}`} />
                                                            </CardAction>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <p className="text-sm text-muted-foreground">{opcao.description}</p>
                                                        </CardContent>
                                                    </Card>
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                        {complementosParaCopiar.length > 0 && (
                                            <>
                                                <DrawerTitle>Adicionados: </DrawerTitle>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead></TableHead>
                                                            <TableHead>Imagem</TableHead>
                                                            <TableHead>Produto</TableHead>
                                                            <TableHead>Preço</TableHead>
                                                            <TableHead>Código PDV</TableHead>
                                                            <TableHead>Ações</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {complementosParaCopiar.map((complemento) => (
                                                            <TableRow key={complemento.id}>
                                                                <TableCell>
                                                                    <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                                                                </TableCell>
                                                                <TableCell>
                                                                    {complemento.imagem ? (
                                                                        <img
                                                                            src={complemento.imagem}
                                                                            alt={complemento.nome}
                                                                            className="size-10 rounded-lg object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                                                            <Images className="size-4 text-muted-foreground" />
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="font-medium">{complemento.nome}</TableCell>
                                                                <TableCell>
                                                                    <InputGroup className="w-32">
                                                                        <InputGroupAddon>R$</InputGroupAddon>
                                                                        <InputGroupInput
                                                                            type="number"
                                                                            value={complemento.preco}
                                                                            onChange={(e) => atualizaComplementoParaCopiar(complemento.id, { preco: Number(e.target.value) })}
                                                                        />
                                                                    </InputGroup>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        placeholder="Código PDV"
                                                                        value={complemento.external_id ?? ""}
                                                                        onChange={(e) => atualizaComplementoParaCopiar(complemento.id, { external_id: e.target.value ? Number(e.target.value) : undefined })}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-muted-foreground hover:text-destructive"
                                                                        onClick={() => removeComplementoParaCopiar(complemento.id)}
                                                                    >
                                                                        <Trash2 />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </>
                                        )}
                                        <DrawerFooter className="flex-row justify-end gap-2">
                                            <Button variant={'destructive'} onClick={() => setContagemSteps(2)} disabled={salvando}>Cancelar</Button>
                                            <Button onClick={salvarGrupoComplemento} disabled={salvando}>Salvar</Button>
                                        </DrawerFooter>
                                    </>
                                )}

                                {modoCriacaoComplemento === 'copiar' && ['ingredientes', 'cross-sell'].includes(tipoGrupoComplemento!) && (
                                    <BuscaSelecaoPaginada
                                        titulo="Copiar complemento"
                                        buscar={buscaComplementosParaCopia}
                                        onAdicionar={adicionaComplementosParaCopiar}
                                        fecharComponente={() => setModoCriacaoComplemento(undefined)}
                                        idsJaAdicionados={complementosParaCopiar.map(c => c.id)}
                                    />
                                )}

                                {modoCriacaoComplemento === 'criar' && ['ingredientes', 'cross-sell'].includes(tipoGrupoComplemento!) && (
                                    <>
                                        <Card className="m-4">
                                            <CardHeader className="flex flex-row justify-between">
                                                <CardTitle className="inline-flex gap-2">{<Plus />} Criar novo complemento</CardTitle>
                                                <CardAction>
                                                    <Button variant={'destructive'}>
                                                        <Trash />
                                                    </Button>
                                                </CardAction>
                                            </CardHeader>
                                            <FieldGroup className="px-4">
                                                <Field>
                                                    <FieldLabel htmlFor="complemento_nome">Nome do produto</FieldLabel>
                                                    <Input
                                                        id="complemento_nome"
                                                        name="complemento_nome"
                                                        value={complemento?.nome ?? ""}
                                                        onInput={(e) => {
                                                            const value = e.currentTarget.value
                                                            setComplemento(prev => ({
                                                                ...prev!,
                                                                nome: value
                                                            }))
                                                        }}
                                                    />
                                                </Field>
                                                <FieldGroup className="flex flex-col gap-4 md:flex-row">
                                                        <Field className="md:flex-1">
                                                            <FieldLabel htmlFor="complemento_descricao">Descrição</FieldLabel>
                                                            <Textarea
                                                                id="complemento_descricao"
                                                                name="complemento_descricao"
                                                                className="h-52 resize-none field-sizing-fixed"
                                                                value={complemento?.descricao ?? ""}
                                                                onInput={(e) => {
                                                                    const value = e.currentTarget.value
                                                                    setComplemento(prev => ({
                                                                        ...prev!,
                                                                        descricao: value
                                                                    }))
                                                                }}
                                                            />
                                                        </Field>
                                                        <Field className="md:w-fit md:shrink-0">
                                                            <FieldLabel>Imagem</FieldLabel>
                                                            <FieldLabel className="cursor-pointer">
                                                                <Attachment state={isUploadingImage ? 'uploading' : 'idle'} orientation={'vertical'} className="size-52">
                                                                    <AttachmentMedia variant={'image'}>
                                                                        {isUploadingImage ? (
                                                                            <Spinner />
                                                                        ) : (
                                                                            <img className="h-full w-full object-cover" src={complemento?.imagem ?? 'https://placehold.co/300'} alt="Imagem de item novo" />
                                                                        )}
                                                                    </AttachmentMedia>
                                                                </Attachment>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={handleFileChange}
                                                                />
                                                            </FieldLabel>
                                                        </Field>
                                                </FieldGroup>

                                                <FieldGroup className="flex flex-col md:grid md:grid-cols-2 gap-4">
                                                    <Field className="flex-1">
                                                        <FieldLabel htmlFor="complemento_preco">Preço</FieldLabel>
                                                        <InputGroup>
                                                            <InputGroupAddon>R$</InputGroupAddon>
                                                            <InputGroupInput
                                                                name="complemento_preco"
                                                                id="complemento_preco"
                                                                value={complemento?.preco ?? 0}
                                                                type="number"
                                                                min={0}
                                                                step={0.01}
                                                                onInput={(e) => {
                                                                    const value = e.currentTarget.value
                                                                    setComplemento(prev => ({
                                                                        ...prev!,
                                                                        preco: value === "" ? 0 : Number(value)
                                                                    }))
                                                                }}
                                                            />
                                                        </InputGroup>
                                                    </Field>
                                                    <Field className="flex-1">
                                                        <FieldLabel htmlFor="complemento_external_id">Código PDV</FieldLabel>
                                                        <Input
                                                            id="complemento_external_id"
                                                            name="complemento_external_id"
                                                            value={complemento?.external_id ?? ""}
                                                            onInput={(e) => {
                                                                const value = e.currentTarget.value
                                                                setComplemento(prev => ({
                                                                    ...prev!,
                                                                    external_id: value
                                                                }))
                                                            }}
                                                        />
                                                    </Field>
                                                </FieldGroup>
                                            </FieldGroup>
                                        </Card>
                                        <DrawerFooter className="flex-row justify-end gap-2">
                                            <Button variant={'destructive'} onClick={() => setContagemSteps(2)} disabled={salvando}>Cancelar</Button>
                                            <Button onClick={adicionaComplementoCriado} disabled={salvando || !complemento?.nome}>Salvar</Button>
                                        </DrawerFooter>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
}
