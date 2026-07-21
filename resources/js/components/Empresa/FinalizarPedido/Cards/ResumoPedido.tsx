import { Card } from "@/components/ui/card";
import {
    IItensCarrinhoProps,
    ItensCarrinho,
} from "../../CardapioDigital/Carrinho";
import { Separator } from "@/components/ui/separator";
import { converteReal } from "@/utils/utils";
import { Button } from "@/components/ui/button";

interface IProps {
    taxa_entrega: number | null,
    subtotal: number,
    total: number
}

export default function ResumoPedido({
    carrinho,
    tipo_funcionamento,
    interacao_id,
    nome_fantasia,
    lista,
    taxa_entrega,
    total,
    subtotal
}: IItensCarrinhoProps & IProps) {
    return (
        <Card>
            <ItensCarrinho carrinho={carrinho} tipo_funcionamento={tipo_funcionamento} interacao_id={interacao_id} nome_fantasia={nome_fantasia} lista={lista} />
            <div className="flex flex-col gap-4 px-4">
                <Separator />
                <div className="flex justify-between items-center">
                    <span className="text-sm">Taxa de entrega</span>
                    <span className="font-bold">R$ {converteReal(taxa_entrega ?? 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm">Subtotal</span>
                    <span className="font-bold">R$ {converteReal(subtotal ?? 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                    <span className="text-sm">Total</span>
                    <span className="font-bold">R$ {converteReal(total ?? 0)}</span>
                </div>
                <Button>Finalizar pedido</Button>
            </div>
        </Card>
    );
}
