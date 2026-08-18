import CashbackResumoCard from "@/components/Cliente/MeusPedidos/CashbackResumoCard";
import CardPedidoCliente from "@/components/Cliente/MeusPedidos/CardPedidoCliente";
import FidelidadeResumoCard from "@/components/Cliente/MeusPedidos/FidelidadeResumoCard";
import { Button } from "@/components/ui/button";
import { ICashbackResumoCliente, IFidelidadeResumoItem, IPedidoCliente } from "@/types/cliente/pedidos";
import { Link } from "@inertiajs/react";
import { ArrowLeft, PackageOpen } from "lucide-react";

interface IProps {
    pedidos: IPedidoCliente[];
    cashbackResumo: ICashbackResumoCliente;
    fidelidadeResumo: IFidelidadeResumoItem[];
}

export default function MeusPedidos({ pedidos, cashbackResumo, fidelidadeResumo }: IProps) {
    const fusoHorario = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return (
        <div className="min-h-screen bg-background/20">
            <header className="sticky top-0 z-20 border-b bg-background">
                <nav className="flex w-full items-center gap-2 px-6 py-4">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        render={<Link href={route("aplicacao.home")} />}
                    >
                        <ArrowLeft className="size-5" />
                    </Button>
                    <span className="font-heading font-semibold">Meus pedidos</span>
                </nav>
            </header>

            <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-6">
                <CashbackResumoCard cashbackResumo={cashbackResumo} timezone={fusoHorario} />
                <FidelidadeResumoCard fidelidadeResumo={fidelidadeResumo} timezone={fusoHorario} />

                <div className="flex flex-col gap-3 sm:gap-4">
                    {pedidos.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12 text-center">
                            <PackageOpen className="size-12 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">Nenhum pedido encontrado</p>
                        </div>
                    ) : (
                        pedidos.map((pedido) => (
                            <CardPedidoCliente key={pedido.id} pedido={pedido} timezone={fusoHorario} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
