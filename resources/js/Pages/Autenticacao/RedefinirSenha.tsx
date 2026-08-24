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
import { Form, usePage } from "@inertiajs/react";
import { Eye, EyeClosed, Loader, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { obtemTokenRecaptcha } from "@/utils/recaptcha";

const INTERVALO_RENOVACAO_TOKEN_MS = 100_000;

interface IProps {
    token: string;
    email: string;
}

export default function RedefinirSenha({ token, email }: IProps) {
    const [senhaVisivel, setSenhaVisivel] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState("");
    const { recaptchaSiteKey } = usePage<{ recaptchaSiteKey: string }>().props;

    useEffect(() => {
        if (!recaptchaSiteKey) return;

        const renovaToken = () =>
            obtemTokenRecaptcha(recaptchaSiteKey, "redefinir_senha").then(setRecaptchaToken);

        renovaToken();
        const intervalId = window.setInterval(renovaToken, INTERVALO_RENOVACAO_TOKEN_MS);

        return () => window.clearInterval(intervalId);
    }, [recaptchaSiteKey]);

    return (
        <main className="bg-primary/10 flex min-h-screen w-full items-center justify-center">
            <Card className="w-full md:w-md">
                <CardHeader>
                    <CardTitle>Redefinir senha</CardTitle>
                    <CardDescription>
                        Escolha uma nova senha para acessar o painel administrativo.
                    </CardDescription>
                </CardHeader>
                <Form
                    action={route("aplicacao.autenticacao.empresa.redefinir-senha.post")}
                    method="POST"
                    transform={(data) => ({
                        ...data,
                        token,
                        email,
                        "g-recaptcha-response": recaptchaToken,
                    })}
                >
                    {({ processing, errors }) => (
                        <>
                            <CardContent className="mb-4">
                                <FieldGroup>
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
                                                defaultValue={email}
                                                readOnly
                                                aria-invalid={!!errors.email}
                                            />
                                        </InputGroup>
                                        {!!errors.email && (
                                            <FieldError>{errors.email}</FieldError>
                                        )}
                                    </Field>
                                    <Field data-invalid={!!errors.password}>
                                        <FieldLabel htmlFor="password">
                                            Nova senha:
                                        </FieldLabel>
                                        <InputGroup className={errors.password ? "border-destructive" : ""}>
                                            <InputGroupAddon className={errors.password ? "text-destructive" : ""}>
                                                <LockKeyhole />
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                type={senhaVisivel ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                required
                                                aria-invalid={!!errors.password}
                                            />
                                            <InputGroupAddon
                                                align="inline-end"
                                                onClick={() => setSenhaVisivel((prev) => !prev)}
                                                className={errors.password ? "text-destructive" : ""}
                                            >
                                                {senhaVisivel ? (
                                                    <EyeClosed className="cursor-pointer" />
                                                ) : (
                                                    <Eye className="cursor-pointer" />
                                                )}
                                            </InputGroupAddon>
                                        </InputGroup>
                                        {!!errors.password && (
                                            <FieldError>{errors.password}</FieldError>
                                        )}
                                        <p className="text-muted-foreground text-xs">
                                            Mínimo de 8 caracteres, com letras e números.
                                        </p>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="password_confirmation">
                                            Confirme a nova senha:
                                        </FieldLabel>
                                        <InputGroup>
                                            <InputGroupAddon>
                                                <LockKeyhole />
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                type={senhaVisivel ? "text" : "password"}
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                required
                                            />
                                        </InputGroup>
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
                                                    Salvando{" "}
                                                    <Loader className="animate-spin" />
                                                </>
                                            ) : (
                                                "Redefinir senha"
                                            )}
                                        </span>
                                    </Button>
                                </div>
                            </CardFooter>
                        </>
                    )}
                </Form>
            </Card>
        </main>
    );
}
