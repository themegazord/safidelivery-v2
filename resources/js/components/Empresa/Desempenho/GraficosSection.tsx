import { ChartsDesempenho, MetricasDesempenho } from "@/types/desempenho";
import FaturamentoDiarioGrafico from "./Graficos/FaturamentoDiarioGrafico";
import HorarioPicoGrafico from "./Graficos/HorarioPicoGrafico";
import FormaPagamentoGrafico from "./Graficos/FormaPagamentoGrafico";
import PedidosModalidadeGrafico from "./Graficos/PedidosModalidadeGrafico";
import OrigemPedidosGrafico from "./Graficos/OrigemPedidosGrafico";

interface IProps {
    charts: ChartsDesempenho | undefined;
    metricas: MetricasDesempenho | undefined;
}

export default function GraficosSection({ charts, metricas }: IProps) {
    return (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <FaturamentoDiarioGrafico charts={charts} />
            <HorarioPicoGrafico charts={charts} />
            <FormaPagamentoGrafico charts={charts} />
            <PedidosModalidadeGrafico charts={charts} />
            <OrigemPedidosGrafico metricas={metricas} />
        </section>
    );
}
