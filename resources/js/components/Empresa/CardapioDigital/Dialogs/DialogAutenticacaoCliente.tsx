import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { router, useForm, usePage } from "@inertiajs/react";
import { useContext, useState } from "react";
import type { MaskitoOptions } from "@maskito/core";
import { useMaskito } from "@maskito/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Loader } from "lucide-react";
import { UsuarioAutenticadoContext } from "@/contexts/Usuario/UsuarioAutenticadoContext";
import { obtemTokenRecaptcha } from "@/utils/recaptcha";

interface IProps {
    open: boolean;
    setOpen: (value: boolean) => void;
}

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
    const [isLoading, setIsLoading] = useState(false);

    const { interacao_id, tipo_funcionamento, configuracoes, recaptchaSiteKey } = usePage<{
        interacao_id: string;
        tipo_funcionamento: string;
        configuracoes: { informa_mesa_comanda: string; modo_atendente: string };
        recaptchaSiteKey: string;
    }>().props;

    const { adicionaUsuarioLogado } = useContext(UsuarioAutenticadoContext);

    const form = useForm({ telefone: "", nome: "" });

    async function consultaClientePorTelefone(telefone: string) {
        try {
            setIsLoading(true);
            const recaptchaToken = await obtemTokenRecaptcha(recaptchaSiteKey, "consulta_cliente");
            const resposta = await axios.post<ClienteResponse>(
                route("aplicacao.autenticacao.cliente.consultaDadosCliente"),
                { telefone, "g-recaptcha-response": recaptchaToken },
            );

            if (resposta.data?.cliente) {
                form.setData("nome", resposta.data.cliente.nome);
            }
        } catch {
        } finally {
            setIsLoading(false);
        }
    }

    async function validaCliente() {
        setIsLoading(true);
        form.clearErrors();

        const recaptchaToken = await obtemTokenRecaptcha(recaptchaSiteKey, "login_cliente");

        router.post(
            route("aplicacao.autenticacao.cliente.autenticaCliente"),
            {
                telefone: form.data.telefone,
                nome: form.data.nome,
                tipo_funcionamento,
                interacao_id,
                modo_atendente: Boolean(Number(configuracoes.modo_atendente)),
                informa_mesa_comanda: Boolean(Number(configuracoes.informa_mesa_comanda)),
                "g-recaptcha-response": recaptchaToken,
            },
            {

                onError: (errors) => {
                    form.setError(errors as Partial<Record<keyof typeof form.data, string>>);
                },
                onFinish: () => setIsLoading(false),
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Seus dados:</DialogTitle>
                    <DialogDescription>
                        Para realizar seu pedido vamos precisar de suas
                        informações, este é um ambiente protegido.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Field>
                        <FieldLabel htmlFor="telefone">
                            Seu número de WhatsApp é:
                        </FieldLabel>
                        <Input
                            id="telefone"
                            placeholder="(00) 0 0000-0000"
                            ref={telefoneMaskRef}
                            aria-invalid={!!form.errors.telefone}
                            onInput={(e) =>
                                form.setData(
                                    "telefone",
                                    e.currentTarget.value,
                                )
                            }
                            onBlur={(e) =>
                                consultaClientePorTelefone(e.currentTarget.value)
                            }
                            disabled={isLoading}
                        />
                        {form.errors.telefone && (
                            <p className="text-destructive text-sm">
                                {form.errors.telefone}
                            </p>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="nome">
                            Seu nome e sobrenome:
                        </FieldLabel>
                        <Input
                            id="nome"
                            placeholder="Nome completo"
                            value={form.data.nome}
                            aria-invalid={!!form.errors.nome}
                            onInput={(e) =>
                                form.setData("nome", e.currentTarget.value)
                            }
                            disabled={isLoading}
                        />
                        {form.errors.nome && (
                            <p className="text-destructive text-sm">
                                {form.errors.nome}
                            </p>
                        )}
                    </Field>
                </div>
                <DialogFooter>
                    <Button
                        className="w-full cursor-pointer"
                        onClick={validaCliente}
                        disabled={isLoading}
                    >
                        Avançar{" "}
                        {isLoading && <Loader className="animate-spin" />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
