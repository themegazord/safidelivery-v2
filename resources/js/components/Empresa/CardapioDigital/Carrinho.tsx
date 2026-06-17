import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { H6 } from "@/components/utils/Heading";
import { CarrinhoContext } from "@/contexts/CardapioDigital/CarrinhoContext";
import { Link, usePage } from "@inertiajs/react";
import { ShoppingBag } from "lucide-react";
import { useContext } from "react";

interface IProps {
    open: boolean;
    setOpen: (valor: boolean) => void;
}

export default function Carrinho({ open, setOpen }: IProps) {
    const { carrinho } = useContext(CarrinhoContext);
    const { interacao_id, tipo_funcionamento, nome_fantasia } = usePage<{
        interacao_id: string;
        tipo_funcionamento: string;
        nome_fantasia: string;
        [key: string]: unknown;
    }>().props;

    return (
        <Drawer open={open} onOpenChange={setOpen} direction="right">
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Carrinho de Compras</DrawerTitle>
                </DrawerHeader>
                {carrinho.length > 0 && (
                    <>
                        <div className="no-scrollbar overflow-y-auto px-4">
                            {carrinho.map((item, idx) => (
                                <div className="bg-background/20 rounded-lg p-4">
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold tracking-wide uppercase opacity-60">
                                            Seu pedido em{" "}
                                            <Link
                                                href={route(
                                                    "aplicacao.empresa.cardapio-digital",
                                                    {
                                                        tipo_funcionamento:
                                                            tipo_funcionamento,
                                                        interacao_id:
                                                            interacao_id,
                                                    },
                                                )}
                                            >
                                                {nome_fantasia}
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {carrinho.length === 0 && (
                    <div className="flex h-96 flex-col items-center justify-center text-center">
                        <ShoppingBag className="mb-4 size-16 opacity-30" />
                        <H6 className="font-medium">Carrinho vazio</H6>
                        <p className="mt-2 text-sm opacity-60">
                            Adicione itens para começar
                        </p>
                    </div>
                )}
            </DrawerContent>
        </Drawer>
    );
}
