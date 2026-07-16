import AdicionarEnderecoNovo from "@/components/Empresa/CardapioDigital/Modais/FinalizarPedido/AdicionarEnderecoNovo";
import AlteraEnderecoPrincipal from "@/components/Empresa/CardapioDigital/Modais/FinalizarPedido/AlteraEnderecoPrincipal";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { H1, H3, H4, H6 } from "@/components/utils/Heading";
import { CarrinhoContext } from "@/contexts/CardapioDigital/CarrinhoContext";
import LayoutCardapio, { ICardapioPageProps } from "@/Layouts/LayoutCardapio";
import { IAuth } from "@/types/usuario-autenticado/usuario";
import { converteReal } from "@/utils/utils";
import { Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { ArrowRightLeft, ChevronLeft, Clock, MapPin, Plus, TriangleAlert } from "lucide-react";
import { ReactNode, useContext, useEffect, useState } from "react";

export default function FinalizarPedido() {
    const { interacao_id, tipo_funcionamento, auth, mesa, enderecoFormatadoEmpresa, configuracoes } = usePage<{
        interacao_id: string;
        tipo_funcionamento: 'delivery' | 'retirada' | 'mesa';
        auth: IAuth,
        mesa: number | undefined,
        enderecoFormatadoEmpresa: string,
        configuracoes: Record<string, string>
    }>().props;
    const [tipoEntrega, setTipoEntrega] = useState<'delivery' | 'retirada' | 'mesa'>(tipo_funcionamento)
    const [numeroMesa, setNumeroMesa] = useState<number | undefined>(mesa)
    const [dadosDistanciaRota, setDadosDistaciaRota] = useState<{
        dadosDistanciaRota: {
            duracao: string,
            latCliente: string,
            lngCliente: string,
            taxaFrete: number | null,
            valorMaximoDesconto: boolean
        },
        foraAreaEntrega: boolean
    } | null>(null)
    const [erroEntrega, setErroEntrega] = useState<string | null>(null)
    const [toggleAlteraEnderecoPrincipal, setToggleAlteraEnderecoPrincipal] = useState<boolean>(false)
    const [toggleCadastraEnderecoNovo, setToggleCadastraEnderecoNovo] = useState<boolean>(false)
    const { carrinho, total } = useContext(CarrinhoContext)


    const TIPOS_ENTREGA = [
        {
            titulo: 'Receber em casa',
            descricao: 'Entrega no seu endereço',
            value: 'delivery',
            disabled: ['retirada', 'delivery']
        },
        {
            titulo: 'Buscar o pedido',
            descricao: 'Retire na loja',
            value: 'retirada',
            disabled: ['retirada', 'delivery']
        },
        {
            titulo: 'Consumir no local',
            descricao: 'Pedido na mesa',
            value: 'mesa',
            disabled: ['mesa']
        },
    ]

    useEffect(() => {
        async function carregaDadosEntrega() {
            await axios.post(route('aplicacao.empresa.finalizar-pedido.consulta-dados-rota'), {
                enderecoFormatadoEmpresa,
                interacao_id,
                configuracoes,
                subtotalPedido: total
            })
            .then((response) => {
                setDadosDistaciaRota(response.data)
                setErroEntrega(null)
            })
            .catch((error) => {
                if (error.response?.status === 422) {
                    setErroEntrega(error.response.data.message)
                }
            })
        }

        carregaDadosEntrega()
    }, [auth.user?.cliente.endereco?.id])

    return (
        <div className="bg-background/20 min-h-screen">
            <div className="flex flex-col gap-4 mx-auto max-w-7xl px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex">
                            <Button variant="link" asChild>
                                <Link href={route('aplicacao.empresa.cardapio-digital', {interacao_id, tipo_funcionamento})}>
                                    <ChevronLeft className="size-6" />
                                </Link>
                            </Button>
                            <H4>Finalize seu pedido</H4>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            {auth.user && auth.user.cliente && (
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <H6>Este pedido será entregue a:</H6>
                                        <Button variant={'link'} className="cursor-pointer">
                                            Trocar
                                        </Button>
                                    </CardTitle>
                                    <CardDescription className="space-y-2 rounded-lg border p-4">
                                        <h3 className="font-semibold">{ auth.user.cliente.nome }</h3>
                                        <p className="text-sm">{ auth.user.cliente.telefone }</p>
                                    </CardDescription>
                                </CardHeader>
                            )}
                            <CardContent className="space-y-3">
                                <H6 className="font-semibold">Escolha como receber o pedido</H6>
                                <div className="space-y-2">
                                    <RadioGroup defaultValue={tipo_funcionamento} className="w-full" onValueChange={(value) => setTipoEntrega(value as typeof tipoEntrega)}>
                                        {TIPOS_ENTREGA.map((te, teIdx) => (
                                            <FieldLabel htmlFor={te.value} key={teIdx}>
                                                <Field orientation="horizontal" data-disabled={!te.disabled.includes(tipo_funcionamento)}>
                                                    <FieldContent>
                                                        <FieldTitle>{te.titulo}</FieldTitle>
                                                        <FieldDescription>{te.descricao}</FieldDescription>
                                                    </FieldContent>
                                                    <RadioGroupItem value={te.value} id={te.value} disabled={!te.disabled.includes(tipo_funcionamento)}/>
                                                </Field>
                                            </FieldLabel>
                                        ))}
                                    </RadioGroup>

                                    {tipo_funcionamento === 'mesa' && (
                                        <Field>
                                            <FieldLabel htmlFor="numeroMesa">Número da mesa:</FieldLabel>
                                            <Input type="number" value={numeroMesa ?? ''} onChange={(e) => setNumeroMesa(e.target.value ? Number(e.target.value) : undefined)}/>
                                        </Field>
                                    )}

                                    {tipo_funcionamento === 'delivery' && (
                                        <>
                                            {auth.user && auth.user.cliente && auth.user.cliente.endereco ? (
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="w-full flex justify-between items-center">
                                                            <div className="flex gap-2">
                                                            <MapPin className="size-5" />
                                                                <div className="flex flex-col">
                                                                    <span className="flex gap-2">
                                                                        <p className="font-medium">
                                                                            {auth.user?.cliente.endereco?.logradouro}, {auth.user?.cliente.endereco?.numero}
                                                                        </p>
                                                                    </span>
                                                                    <span className="text-sm text-foreground/60">
                                                                        {auth.user?.cliente.endereco?.cidade}/{auth.user?.cliente.endereco?.uf}
                                                                    </span> 
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-4 sm:flex-row">
                                                                {(auth.user?.cliente.enderecos.length ?? 0)> 1 && (
                                                                    <Button className="cursor-pointer" size={"sm"} variant={"ghost"} onClick={() => setToggleAlteraEnderecoPrincipal(true)}>Trocar {" "} <ArrowRightLeft /></Button>
                                                                )}
                                                                <Button className="cursor-pointer" size={"sm"} variant={"ghost"} onClick={() => setToggleCadastraEnderecoNovo(true)} >Novo {" "} <Plus /></Button>
                                                            </div>
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {!erroEntrega ? (
                                                            <div className="flex items-center gap-2 pt-2">
                                                                <Clock className="size-5" />
                                                                <div>
                                                                    <p className="font-medium">Padrão</p>
                                                                    <p className="text-sm">Hoje, {dadosDistanciaRota?.dadosDistanciaRota.duracao}</p>
                                                                    {(dadosDistanciaRota?.dadosDistanciaRota.taxaFrete ?? null) === 0 && Number(configuracoes.frete_gratis_acima ?? 0) > 0 ? (
                                                                        <p className="text-sm font-medium text-green-400">Frete grátis aplicado!</p>
                                                                    ) : (
                                                                        <>
                                                                            <p className="text-sm font-medium">Taxa de entrega: R$ {converteReal(dadosDistanciaRota?.dadosDistanciaRota.taxaFrete ?? 0)}</p>
                                                                            {Number(configuracoes.frete_gratis_acima ?? 0) > 0 && total < Number(configuracoes.frete_gratis_acima ?? 0) && (
                                                                                <p className="text-xs">Faltam: R$ {converteReal(Number(configuracoes.frete_gratis_acima ?? 0) - total)} para frete grátis</p>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Alert className="border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-50">
                                                                <TriangleAlert />
                                                                <AlertDescription>
                                                                    {erroEntrega}
                                                                </AlertDescription>
                                                            </Alert>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                                                    <TriangleAlert />
                                                    <AlertDescription>Você precisa cadastrar um endereço para continuar.</AlertDescription>
                                                    <AlertAction>
                                                        <Button>
                                                            <Plus />{" "}Cadastrar um endereço
                                                        </Button>
                                                    </AlertAction>
                                                </Alert>
                                            )}
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <AlteraEnderecoPrincipal open={toggleAlteraEnderecoPrincipal} setOpen={setToggleAlteraEnderecoPrincipal} auth={auth}/>
            <AdicionarEnderecoNovo open={toggleCadastraEnderecoNovo} setOpen={setToggleCadastraEnderecoNovo} />
        </div>
    );
}

FinalizarPedido.layout = (page: ReactNode) => (
    <LayoutCardapio>{page}</LayoutCardapio>
);
