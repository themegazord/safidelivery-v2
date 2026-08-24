import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Form, Link, usePage } from "@inertiajs/react";
import { Loader, Mail, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { obtemTokenRecaptcha } from "@/utils/recaptcha";

const INTERVALO_RENOVACAO_TOKEN_MS = 100_000;

export default function EsqueciSenha() {
    const [recaptchaToken, setRecaptchaToken] = useState("");
    const { recaptchaSiteKey, flash } = usePage<{
        recaptchaSiteKey: string;
        flash: { status?: string };
    }>().props;

    useEffect(() => {
        if (!recaptchaSiteKey) return;

        const renovaToken = () =>
            obtemTokenRecaptcha(recaptchaSiteKey, "esqueci_senha").then(setRecaptchaToken);

        renovaToken();
        const intervalId = window.setInterval(renovaToken, INTERVALO_RENOVACAO_TOKEN_MS);

        return () => window.clearInterval(intervalId);
    }, [recaptchaSiteKey]);

    return (
        <main className="bg-primary/10 flex min-h-screen w-full items-center justify-center">
            <Card className="w-full md:w-md">
                <CardHeader>
                    <CardTitle>Esqueci minha senha</CardTitle>
                    <CardDescription>
                        Informe o e-mail cadastrado e enviaremos um link para redefinir sua senha.
                    </CardDescription>
                </CardHeader>
                <Form
                    action={route("aplicacao.autenticacao.empresa.esqueci-senha.post")}
                    method="POST"
                    transform={(data) => ({ ...data, "g-recaptcha-response": recaptchaToken })}
                >
                    {({ processing, errors }) => (
                        <>
                            <CardContent className="mb-4">
                                <FieldGroup>
                                    {!!flash.status && (
                                        <p className="text-center text-sm text-green-600">
                                            {flash.status}
                                        </p>
                                    )}
                                    <Field data-invalid={!!errors.email}>
                                        <FieldLabel htmlFor="email">
                                            Email corporativo:
                                        </FieldLabel>
                                        <InputGroup className={errors.email ? "border-destructive" : ""}>
                                            <InputGroupAddon className={errors.email ? "text-destructive" : ""}>
                                                <Mail />
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                type="email"
                                                id="email"
                                                name="email"
                                                placeholder="empresa@email.com"
                                                required
                                                aria-invalid={!!errors.email}
                                            />
                                        </InputGroup>
                                        {!!errors.email && (
                                            <FieldError>{errors.email}</FieldError>
                                        )}
                                    </Field>
                                </FieldGroup>
                            </CardContent>
                            <CardFooter>
                                <div className="flex w-full flex-col gap-2">
                                    {!!errors["g-recaptcha-response"] && (
                                        <p className="text-destructive text-center text-sm">
                                            {errors["g-recaptcha-response"]}
                                        </p>
                                    )}
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        <span className="flex items-center gap-2">
                                            {processing ? (
                                                <>
                                                    Enviando{" "}
                                                    <Loader className="animate-spin" />
                                                </>
                                            ) : (
                                                <>
                                                    Enviar link <Send />
                                                </>
                                            )}
                                        </span>
                                    </Button>
                                    <Link
                                        href={route("aplicacao.autenticacao.empresa.login")}
                                        className="text-center"
                                    >
                                        Voltar para o login
                                    </Link>
                                </div>
                            </CardFooter>
                        </>
                    )}
                </Form>
            </Card>
        </main>
    );
}
