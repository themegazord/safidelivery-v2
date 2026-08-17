import Carrinho from "@/components/Empresa/CardapioDigital/Carrinho";
import DialogAutenticacaoCliente from "@/components/Empresa/CardapioDigital/Dialogs/DialogAutenticacaoCliente";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Toaster } from "@/components/ui/sonner";
import { CarrinhoContext } from "@/contexts/CardapioDigital/CarrinhoContext";
import CarrinhoProvider from "@/providers/CardapioDigital/CarrinhoProvider";
import PedidoModalProvider from "@/providers/CardapioDigital/PedidoModalProvider";
import UsuarioAutenticadoProvider from "@/providers/Usuario/UsuarioAutenticadoProvider";
import { Link, usePage } from "@inertiajs/react";
import { ConciergeBell, Motorbike, ShoppingCart } from "lucide-react";
import { ReactNode, useContext, useEffect, useState } from "react";

export interface ICardapioPageProps {
    interacao_id: string;
    tipo_funcionamento: string;
    [key: string]: unknown;
}

function LayoutCardapioContent({ children }: { children: ReactNode }) {
    const { interacao_id, tipo_funcionamento } =
        usePage<ICardapioPageProps>().props;
    const quantidadeCarrinho = useContext(CarrinhoContext).carrinho.length;
    const [carrinhoStatus, setCarrinhoStatus] = useState<boolean>(false)
    const [autenticacaoDialogStatus, setAutenticacaoDialogStatus] = useState<boolean>(false)

    const { url: currentUrl } = usePage();
    useEffect(() => {
        setCarrinhoStatus(false);
        setAutenticacaoDialogStatus(false);
    }, [currentUrl]);

    return (
        <div className="flex flex-col gap-4">
            <header className="bg-background border-border sticky top-0 z-20 border-b">
                <nav className="flex w-full justify-between px-6 py-4">
                    <Button
                        className="cursor-pointer"
                        variant="ghost"
                        render={
                            <Link
                                className="flex gap-2"
                                href={route("aplicacao.empresa.cardapio-digital", {
                                    interacao_id,
                                    tipo_funcionamento,
                                })}
                            />
                        }
                    >
                        {tipo_funcionamento === "delivery" ? (
                            <Motorbike className="size-6" />
                        ) : (
                            <ConciergeBell className="size-6" />
                        )}{" "}
                        SAFI Delivery
                    </Button>

                    <Button variant="ghost" className="relative cursor-pointer" onClick={(e) => { (e.currentTarget as HTMLButtonElement).blur(); setCarrinhoStatus(true); }}>
                        <ShoppingCart className="size-6" />
                        {quantidadeCarrinho > 0 && (
                            <Badge className="-right-1.5 bg-primary text-primary-foreground absolute -top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[11px] font-bold">
                                {quantidadeCarrinho}
                            </Badge>
                        )}
                    </Button>
                </nav>
            </header>
            <main className="container mx-auto">{children}</main>
            <Carrinho open={carrinhoStatus} setOpen={setCarrinhoStatus} setOpenAutenticacao={setAutenticacaoDialogStatus}/>
            <DialogAutenticacaoCliente open={autenticacaoDialogStatus} setOpen={setAutenticacaoDialogStatus}/>
            <Toaster />
        </div>
    );
}

export default function LayoutCardapio({ children }: { children: ReactNode }) {
    return (
        <UsuarioAutenticadoProvider>
            <CarrinhoProvider>
                <PedidoModalProvider>
                    <LayoutCardapioContent>{children}</LayoutCardapioContent>
                </PedidoModalProvider>
            </CarrinhoProvider>
        </UsuarioAutenticadoProvider>
    );
}
