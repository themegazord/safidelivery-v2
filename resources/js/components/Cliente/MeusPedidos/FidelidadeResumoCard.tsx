import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IFidelidadeResumoItem } from "@/types/cliente/pedidos";
import ItemFidelidadeResumo from "./ItemFidelidadeResumo";

interface IProps {
    fidelidadeResumo: IFidelidadeResumoItem[];
    timezone: string;
}

export default function FidelidadeResumoCard({ fidelidadeResumo, timezone }: IProps) {
    if (fidelidadeResumo.length === 0) {
        return null;
    }

    return (
        <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="size-5 text-primary" />
                    Minha Fidelidade
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {fidelidadeResumo.map((item, idx) => (
                    <ItemFidelidadeResumo key={idx} item={item} timezone={timezone} />
                ))}
            </CardContent>
        </Card>
    );
}
