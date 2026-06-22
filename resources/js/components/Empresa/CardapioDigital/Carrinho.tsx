import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { H6 } from "@/components/utils/Heading";
import { CarrinhoContext } from "@/contexts/CardapioDigital/CarrinhoContext";
import { Link, usePage } from "@inertiajs/react";
import { AlertTriangle, ChevronRight, ShoppingBag } from "lucide-react";
import { useContext } from "react";
import ItemCarrinho from "./ItemCarrinho";
import { converteReal } from "@/utils/utils";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface IProps {
    open: boolean;
    setOpen: (valor: boolean) => void;
    setOpenAutenticacao: (valor: boolean) => void
}

export default function Carrinho({ open, setOpen, setOpenAutenticacao }: IProps) {
    const { carrinho, total } = useContext(CarrinhoContext);
    const { interacao_id, tipo_funcionamento, nome_fantasia, lojaAberta, auth, configuracoes } =
        usePage<{
            interacao_id: string;
            tipo_funcionamento: string;
            nome_fantasia: string;
            lojaAberta: boolean;
            auth: {user: {id: number, name: string, email: string} | null};
            configuracoes: {informa_mesa_comanda: string, modo_atendente: string}
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
                            <div className="bg-background/20 rounded-lg p-4">
                                <div className="mb-3">
                                    <p className="text-xs font-semibold tracking-wide uppercase opacity-60">
                                        Seu pedido em {nome_fantasia}
                                    </p>
                                </div>
                                <Link
                                    href={route(
                                        "aplicacao.empresa.cardapio-digital",
                                        {
                                            tipo_funcionamento:
                                                tipo_funcionamento,
                                            interacao_id: interacao_id,
                                        },
                                    )}
                                    className="hover:text-primary-focus text-primary inline-flex items-center gap-1 text-sm font-medium"
                                >
                                    {<ChevronRight />} Ver cardápio completo
                                </Link>
                            </div>
                            <div className="my-4 flex flex-col gap-4">
                                {carrinho.map((item, idx) => (
                                    <ItemCarrinho
                                        item={item}
                                        idx={idx}
                                        key={idx}
                                    />
                                ))}
                            </div>
                        </div>
                        <DrawerFooter>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="opacity-70">Subtotal</span>
                                    <span className="font-semibold">
                                        R$ {converteReal(total)}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="opacity-70">Subtotal</span>
                                    <span className="font-semibold">
                                        R$ {converteReal(total)}
                                    </span>
                                </div>
                                {!lojaAberta && (
                                    <Alert className="border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-50">
                                        <AlertTitle>
                                            <AlertTriangle /> Loja fechada
                                        </AlertTitle>
                                        <AlertDescription>
                                            No momento estamos fechados.
                                            Voltaremos em breve!
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {!Boolean(Number(configuracoes.modo_atendente)) && (
                                    <Button className="w-full cursor-pointer" disabled={!lojaAberta} onClick={() => setOpenAutenticacao(true)}>Ir para pagamento</Button>
                                )}
                            </div>
                        </DrawerFooter>
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
