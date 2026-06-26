import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { H1, H3, H4, H6 } from "@/components/utils/Heading";
import LayoutCardapio, { ICardapioPageProps } from "@/Layouts/LayoutCardapio";
import { IAuth } from "@/types/usuario-autenticado/usuario";
import { Link, usePage } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";
import { ReactNode, useState } from "react";

export default function FinalizarPedido() {
    const { interacao_id, tipo_funcionamento, auth } = usePage<{
        interacao_id: string;
        tipo_funcionamento: 'delivery' | 'retirada' | 'mesa';
        auth: IAuth
    }>().props;
    const [tipoEntrega, setTipoEntrega] = useState<'delivery' | 'retirada' | 'mesa'>(tipo_funcionamento)

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
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

FinalizarPedido.layout = (page: ReactNode) => (
    <LayoutCardapio>{page}</LayoutCardapio>
);
