import {
    ICashbackResumoCliente,
    IFidelidadeResumoItem,
} from "@/types/cliente/pedidos";
import CashbackResumoCard from "./CashbackResumoCard";
import FidelidadeResumoCard from "./FidelidadeResumoCard";

interface IProps {
    cashbackResumo: ICashbackResumoCliente;
    fidelidadeResumo: IFidelidadeResumoItem[];
}

export default function ResumoClienteSection({
    cashbackResumo,
    fidelidadeResumo,
}: IProps) {
    if (cashbackResumo.gerado <= 0 && fidelidadeResumo.length === 0) {
        return null;
    }

    return (
        <section
            aria-label="Resumo da conta"
            className="grid gap-4 lg:grid-cols-2 lg:items-start"
        >
            <CashbackResumoCard cashbackResumo={cashbackResumo} />
            <FidelidadeResumoCard fidelidadeResumo={fidelidadeResumo} />
        </section>
    );
}
