import { ICashbackResumoCliente, IFidelidadeResumoItem } from "@/types/cliente/pedidos";
import CashbackResumoCard from "./CashbackResumoCard";
import FidelidadeResumoCard from "./FidelidadeResumoCard";

interface IProps {
    cashbackResumo: ICashbackResumoCliente;
    fidelidadeResumo: IFidelidadeResumoItem[];
    timezone: string;
}

export default function ResumoClienteSection({ cashbackResumo, fidelidadeResumo, timezone }: IProps) {
    if (cashbackResumo.gerado <= 0 && fidelidadeResumo.length === 0) {
        return null;
    }

    return (
        <section className="grid gap-4 lg:grid-cols-2">
            <CashbackResumoCard cashbackResumo={cashbackResumo} timezone={timezone} />
            <FidelidadeResumoCard fidelidadeResumo={fidelidadeResumo} timezone={timezone} />
        </section>
    );
}
