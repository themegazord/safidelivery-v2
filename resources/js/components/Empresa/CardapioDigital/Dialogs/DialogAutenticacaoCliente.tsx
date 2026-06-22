import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@inertiajs/react";
import { useEffect, useState } from "react";
import type { MaskitoOptions } from "@maskito/core";
import { useMaskito } from "@maskito/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios, { AxiosResponse } from "axios";

interface IProps {
    open: boolean;
    setOpen: (value: boolean) => void;
}

type TUndefinedString = string | undefined;
const telefoneMask: MaskitoOptions = {
    mask: [
        "(",
        /\d/,
        /\d/,
        ")",
        " ",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        "-",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
    ],
};

interface ClienteResponse {
    cliente: {
        id: number;
        nome: string;
        telefone: string;
    };
}

export default function DialogAutenticacaoCliente({ open, setOpen }: IProps) {
    const telefoneMaskRef = useMaskito({ options: telefoneMask });
    const [dadosUsuario, setDadosUsuario] = useState<{
        telefone: TUndefinedString;
        nome: TUndefinedString;
    }>({ telefone: "", nome: "" });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function consultaClientePorTelefone(telefone: string) {
        let resposta: AxiosResponse<ClienteResponse> | undefined = undefined;

        try {
            setIsLoading(true);
            resposta = await axios.post<ClienteResponse>(
                route('aplicacao.autenticacao.cliente.consultaDadosCliente'),
                { telefone },
            );

            if (resposta?.status === 200 && resposta?.data?.cliente) {
                setDadosUsuario(prev => ({...prev, nome: resposta?.data?.cliente.nome}))
            }
        } catch (error) {} finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Form className="space-y-4">
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Seus dados:</DialogTitle>
                        <DialogDescription>
                            Para realizar seu pedido vamos precisar de suas
                            informações, este é um ambiente protegido.
                        </DialogDescription>
                    </DialogHeader>
                    <Field>
                        <FieldLabel htmlFor="telefoneCliente">
                            Seu número de WhatsApp é:
                        </FieldLabel>
                        <Input
                            placeholder="(00) 0 0000-0000"
                            ref={telefoneMaskRef}
                            onInput={(e) =>
                                setDadosUsuario((prev) => ({
                                    ...prev,
                                    telefone: e.currentTarget.value,
                                }))
                            }
                            onBlur={(e) => consultaClientePorTelefone(e.currentTarget.value)}
                            disabled={isLoading}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="nomeCliente">
                            Seu nome e sobrenome:
                        </FieldLabel>
                        <Input
                            placeholder="Nome completo"
                            value={dadosUsuario.nome}
                            onInput={(e) =>
                                setDadosUsuario((prev) => ({
                                    ...prev,
                                    nome: e.currentTarget.value,
                                }))
                            }
                        />
                    </Field>
                    <DialogFooter>
                        <Button className="w-full cursor-pointer" type="submit">
                            Avançar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Form>
        </Dialog>
    );
}
