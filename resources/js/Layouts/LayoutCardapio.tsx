import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CarrinhoContext } from "@/contexts/CardapioDigital/CarrinhoContext";
import CarrinhoProvider from "@/providers/CardapioDigital/CarrinhoProvider";
import { Link, usePage } from "@inertiajs/react";
import { ConciergeBell, Motorbike, ShoppingCart } from "lucide-react";
import { ReactNode, useContext } from "react";

interface ICardapioPageProps {
    interacao_id: string;
    tipo_funcionamento: string;
    [key: string]: unknown;
}

function LayoutCardapioContent({ children }: { children: ReactNode }) {
    const { interacao_id, tipo_funcionamento } =
        usePage<ICardapioPageProps>().props;
    const quantidadeCarrinho = useContext(CarrinhoContext).carrinho.length;

    return (
        <div className="flex flex-col gap-4">
            <header className="bg-background border-border sticky top-0 z-20 border-b">
                <nav className="flex w-full justify-between px-6 py-4">
                    <Button className="cursor-pointer" variant="ghost" asChild>
                        <Link
                            className="flex gap-2"
                            href={route("aplicacao.empresa.cardapio-digital", {
                                interacao_id,
                                tipo_funcionamento,
                            })}
                        >
                            {tipo_funcionamento === "delivery" ? (
                                <Motorbike className="size-6" />
                            ) : (
                                <ConciergeBell className="size-6" />
                            )}{" "}
                            SAFI Delivery
                        </Link>
                    </Button>

                    <Button variant="ghost" className="relative cursor-pointer">
                        <ShoppingCart className="size-6" />
                        {quantidadeCarrinho > 0 && (
                            <Badge className="-right-1com.5 bg-primary text-primary-foreground absolute -top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[11px] font-bold">
                                {quantidadeCarrinho}
                            </Badge>
                        )}
                    </Button>
                </nav>
            </header>
            <main className="container mx-auto">{children}</main>
        </div>
    );
}

export default function LayoutCardapio({ children }: { children: ReactNode }) {
    return (
        <CarrinhoProvider>
            <LayoutCardapioContent>{children}</LayoutCardapioContent>
        </CarrinhoProvider>
    );
}
