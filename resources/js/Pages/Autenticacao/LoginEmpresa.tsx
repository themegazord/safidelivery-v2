import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ValidatedFieldForm from "@/components/utils/ValidatedFieldForm";
import { Form, Link, usePage } from "@inertiajs/react";
import { Loader, LogIn } from "lucide-react";

export default function LoginEmpresa() {
    const { errors } = usePage().props
    return (
        <main className="w-full min-h-screen flex justify-center items-center bg-primary/10">
            <Card className="w-full md:w-md p-4">
                <CardHeader>
                    <CardTitle>Login Empresa</CardTitle>
                    <CardDescription>Acesse o painel administrativo</CardDescription>
                </CardHeader>
                <Form action={route('aplicacao.autenticacao.empresa.login')} method="POST">
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
                                <div className="flex flex-col gap-2 w-full">
                                    <Button className="w-full">
                                        <span className="flex items-center gap-2">
                                            {processing ? (<>Entrando <Loader className="animate-spin" /></>) : (<>Entrar <LogIn /></>)}
                                        </span>
                                    </Button>
                                    <Link href="#" className="text-center">Esqueci minha senha</Link>
                                </div>
                            </CardFooter>
                        </>
                    )}
                </Form>
            </Card>
        </main>
    )
}
