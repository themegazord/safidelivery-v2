import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IFidelidadeResumoItem } from "@/types/cliente/pedidos";
import ItemFidelidadeResumo from "./ItemFidelidadeResumo";

interface IProps {
    fidelidadeResumo: IFidelidadeResumoItem[];
}

export default function FidelidadeResumoCard({ fidelidadeResumo }: IProps) {
    if (fidelidadeResumo.length === 0) {
        return null;
    }

    return (
        <Card className="border-primary/20 overflow-hidden shadow-sm">
            <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                    <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
                        <Star className="size-4" />
                    </span>
                    Minha Fidelidade
                </CardTitle>
                <p className="text-muted-foreground text-xs">
                    {fidelidadeResumo.length} programa
                    {fidelidadeResumo.length > 1 ? "s" : ""} ativo
                    {fidelidadeResumo.length > 1 ? "s" : ""}
                </p>
            </CardHeader>

            <CardContent className="divide-y p-0">
                {fidelidadeResumo.map((item, idx) => (
                    <div key={idx} className="px-6 py-3">
                        <ItemFidelidadeResumo item={item} />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
