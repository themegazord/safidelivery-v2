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
import { Eye, EyeClosed, Loader, Lock, LogIn, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { obtemTokenRecaptcha } from "@/utils/recaptcha";

// Token v3 expira em ~2min — renovado periodicamente para sempre ter um válido pronto no submit.
const INTERVALO_RENOVACAO_TOKEN_MS = 100_000;

export default function LoginEmpresa() {
    const [senhaVisivel, setSenhaVisivel] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState("");
    const { recaptchaSiteKey } = usePage<{ recaptchaSiteKey: string }>().props;

    useEffect(() => {
        if (!recaptchaSiteKey) return;

        const renovaToken = () =>
            obtemTokenRecaptcha(recaptchaSiteKey, "login_empresa").then(setRecaptchaToken);

        renovaToken();
        const intervalId = window.setInterval(renovaToken, INTERVALO_RENOVACAO_TOKEN_MS);

        return () => window.clearInterval(intervalId);
    }, [recaptchaSiteKey]);

    return (
        <main className="bg-primary/10 flex min-h-screen w-full items-center justify-center">
            <Card className="w-full md:w-md">
                <CardHeader>
                    <CardTitle>Login Empresa</CardTitle>
                    <CardDescription>
                        Acesse o painel administrativo
                    </CardDescription>
                </CardHeader>
                <Form
                    action={route("aplicacao.autenticacao.empresa.login")}
                    method="POST"
                    transform={(data) => ({ ...data, "g-recaptcha-response": recaptchaToken })}
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
                                                placeholder="empresa@email.com"
                                                required
                                                aria-invalid={!!errors.email}
                                            />
                                        </InputGroup>
                                        {!!errors.email && (
                                            <FieldError>{errors.email}</FieldError>
                                        )}
                                    </Field>
                                    <Field data-invalid={!!errors.password}>
                                        <FieldLabel htmlFor="password">
                                            Sua senha:
                                        </FieldLabel>
                                        <InputGroup className={errors.password ? "border-destructive" : ""}>
                                            <InputGroupAddon className={errors.password ? "text-destructive" : ""}>
                                                <Lock />
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
                                                    Entrando{" "}
                                                    <Loader className="animate-spin" />
                                                </>
                                            ) : (
                                                <>
                                                    Entrar <LogIn />
                                                </>
                                            )}
                                        </span>
                                    </Button>
                                    <Link href="#" className="text-center">
                                        Esqueci minha senha
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
