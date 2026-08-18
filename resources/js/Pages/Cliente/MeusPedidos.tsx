import ListaPedidosCliente from "@/components/Cliente/MeusPedidos/ListaPedidosCliente";
import MeusPedidosHeader from "@/components/Cliente/MeusPedidos/MeusPedidosHeader";
import ResumoClienteSection from "@/components/Cliente/MeusPedidos/ResumoClienteSection";
import { ICashbackResumoCliente, IFidelidadeResumoItem, IPedidoCliente } from "@/types/cliente/pedidos";

interface IProps {
    pedidos: IPedidoCliente[];
    cashbackResumo: ICashbackResumoCliente;
    fidelidadeResumo: IFidelidadeResumoItem[];
}

export default function MeusPedidos({ pedidos, cashbackResumo, fidelidadeResumo }: IProps) {
    const fusoHorario = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return (
        <div className="min-h-screen bg-background/20">
            <MeusPedidosHeader />

            <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <ResumoClienteSection
                    cashbackResumo={cashbackResumo}
                    fidelidadeResumo={fidelidadeResumo}
                    timezone={fusoHorario}
                />
                <ListaPedidosCliente pedidos={pedidos} timezone={fusoHorario} />
            </main>
        </div>
    );
}
