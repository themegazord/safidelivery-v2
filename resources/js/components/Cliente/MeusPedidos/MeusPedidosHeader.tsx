import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function MeusPedidosHeader() {
    return (
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="-ml-2 shrink-0"
                    aria-label="Voltar"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="size-5" />
                </Button>

                <div className="min-w-0">
                    <h1 className="truncate text-base font-semibold leading-tight sm:text-lg">
                        Meus pedidos
                    </h1>
                    <p className="truncate text-xs text-muted-foreground">
                        Histórico, cashback e fidelidade
                    </p>
                </div>
            </div>
        </header>
    );
}
