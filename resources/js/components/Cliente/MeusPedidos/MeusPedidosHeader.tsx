import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

export default function MeusPedidosHeader() {
    return (
        <header className="sticky top-0 z-20 border-b bg-background">
            <nav className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-4 sm:px-6 lg:px-8">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    render={<Link href={route("aplicacao.home")} />}
                >
                    <ArrowLeft className="size-5" />
                </Button>
                <span className="font-heading text-base font-semibold sm:text-lg">Meus pedidos</span>
            </nav>
        </header>
    );
}
