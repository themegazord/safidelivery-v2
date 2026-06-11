import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import ValidatedFieldForm from "@/components/utils/ValidatedFieldForm";
import { Form, Link, usePage } from "@inertiajs/react";
import { Loader, LogIn } from "lucide-react";

export default function LoginEmpresa() {
    const { errors } = usePage().props;
    return (
        <main className="bg-primary/10 flex min-h-screen w-full items-center justify-center">
            <Card className="w-full p-4 md:w-md">
                <CardHeader>
                    <CardTitle>Login Empresa</CardTitle>
                    <CardDescription>
                        Acesse o painel administrativo
                    </CardDescription>
                </CardHeader>
                <Form
                    action={route("aplicacao.autenticacao.empresa.login")}
                    method="POST"
                >
                    {({ processing }) => (
                        <>
                            <CardContent>
                                <ValidatedFieldForm
                                    errors={errors}
                                    haveObjectiveIcon
                                    htmlFor="email"
                                    htmlId="email"
                                    htmlName="email"
                                    htmlPlaceholder="empresa@email.com"
                                    isRequired
                                    label="Email corporativo:"
                                    objective="email"
                                    trigger="email"
                                    typeInput="email"
                                />
                                <ValidatedFieldForm
                                    errors={errors}
                                    haveObjectiveIcon
                                    htmlFor="password"
                                    htmlId="password"
                                    htmlName="password"
                                    isRequired
                                    label="Sua senha:"
                                    objective="password"
                                    trigger="password"
                                    typeInput="password"
                                />
                            </CardContent>
                            <CardFooter>
                                <div className="flex w-full flex-col gap-2">
                                    <Button className="w-full">
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
