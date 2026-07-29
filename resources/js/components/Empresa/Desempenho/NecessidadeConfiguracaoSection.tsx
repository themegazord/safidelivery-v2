import { INecessidade } from "@/types/desempenho";
import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";

interface IProps {
    necessidades: INecessidade[];
}

export default function NecessidadeConfiguracaoSection({
    necessidades,
}: IProps) {
    return (
        <section>
            {necessidades.length >= 1 && (
                <div className="container flex w-full flex-col gap-4">
                    {necessidades.map((necessidade, idx) => (
                        <Alert
                            className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50"
                            key={idx}
                        >
                            <AlertTitle className="flex gap-4">
                                <AlertCircleIcon />
                                {necessidade.titulo}
                            </AlertTitle>
                            <AlertDescription>
                                {necessidade.mensagem}
                            </AlertDescription>
                            <AlertAction>
                                <Button
                                    variant={"outline"}
                                    render={
                                        <Link
                                            href={route(
                                                necessidade.link.nomeRota,
                                                necessidade.link.paramRota,
                                            )}
                                        />
                                    }
                                >
                                    Configurar
                                </Button>
                            </AlertAction>
                        </Alert>
                    ))}
                </div>
            )}
        </section>
    );
}
