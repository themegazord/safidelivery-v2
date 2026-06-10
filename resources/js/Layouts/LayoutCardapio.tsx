import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import { ConciergeBell, Motorbike, ShoppingCart, Truck } from "lucide-react";
import { ReactNode, useState } from "react";

interface IProps {
    children: ReactNode
    recebeInteracaoId: string,
    recebeTipoFuncionamento: string
}

export default function LayoutCardapio({ children, recebeInteracaoId, recebeTipoFuncionamento }: IProps) {
    return (
        <div className="flex flex-col gap-4">
            <header className="sticky top-0 z-20 bg-background border-b border-border">
                <nav className="flex justify-between px-6 py-4 w-full">
                    <Button className="cursor-pointer" variant="ghost" asChild>
                        <Link className="flex gap-2" href={route('aplicacao.empresa.cardapio-digital', { interacao_id: recebeInteracaoId, tipo_funcionamento: recebeTipoFuncionamento })}>
                            {recebeTipoFuncionamento === 'delivery' ? (<Motorbike className="size-6" />) : (<ConciergeBell className="size-6" />)} SAFI Delivery
                        </Link>
                    </Button>

                    <Button variant="ghost" className="cursor-pointer">
                        <ShoppingCart className="size-6" />
                    </Button>
                </nav>
            </header>
            <main className="container mx-auto">
                {children}
            </main>
        </div>
    );
}
