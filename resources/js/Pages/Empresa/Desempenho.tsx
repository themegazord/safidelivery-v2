import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { DadosDesempenho, INecessidade } from "@/types/desempenho";
import NecessidadeConfiguracaoSection from "@/components/Empresa/Desempenho/NecessidadeConfiguracaoSection";
import HeaderDesempenho from "@/components/Empresa/Desempenho/HeaderDesempenho";
import VisaoGeralHojeSection from "@/components/Empresa/Desempenho/VisaoGeralHojeSection";
import PerformanceSection from "@/components/Empresa/Desempenho/PerformanceSection";
import GraficosSection from "@/components/Empresa/Desempenho/GraficosSection";

interface IProps {
    necessidadesConfiguracao: INecessidade[];
    temTokenIfood: boolean;
    estaRecebendoIfood: boolean;
    linkDelivery: string;
    linkMesa: string;
}

export default function Desempenho({
    necessidadesConfiguracao,
    temTokenIfood,
    estaRecebendoIfood: estaRecebendoIfoodInicial,
    linkDelivery,
    linkMesa,
}: IProps) {
    const { cnpj } = usePage().props;
    const diaPadrao = 7;
    const [estaRecebendoIfood, setEstaRecebendoIfood] = useState(
        estaRecebendoIfoodInicial
    );
    const [dataInicioFiltro, setDataInicioFiltro] = useState(diaPadrao);
    const [dadosBackend, setDadosBackend] = useState<DadosDesempenho | null>(
        null,
    );

    useEffect(() => {
        axios
            .post(
                route("aplicacao.empresa.desempenho.buscaPedidosPorData", {
                    cnpj,
                }),
                {
                    dias: dataInicioFiltro,
                },
            )
            .then(({ data }) => {
                setDadosBackend(data);
                console.log(data);
            })
            .catch(console.error);
    }, [dataInicioFiltro]);

    function configuraRecebimentoIfood(novoValor: boolean) {
        setEstaRecebendoIfood(novoValor);
        router.patch(route("aplicacao.empresa.configuracoes", { cnpj }), {
            esta_recebendo_pedidos_ifood: novoValor,
        });
    }

    function copiar(link: string) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link);
            return;
        }
        const textarea = document.createElement("textarea");
        textarea.value = link;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    }

    function intervaloData(): string {
        const hoje = new Date();
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - dataInicioFiltro);

        const formatar = (d: Date) =>
            d.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });

        return `${formatar(inicio)} a ${formatar(hoje)}`;
    }

    return (
        <LayoutAutenticado>
            <div className="container w-full">
                <NecessidadeConfiguracaoSection necessidades={necessidadesConfiguracao} />

                <HeaderDesempenho 
                    temTokenIfood={temTokenIfood}
                    checkedValue={estaRecebendoIfood}
                    setCheckedValue={configuraRecebimentoIfood}
                    fnCopiar={copiar}
                    linkDelivery={linkDelivery}
                    linkMesa={linkMesa}
                />

                <VisaoGeralHojeSection 
                    financeiroPedidosHoje={dadosBackend?.financeiro_pedidos_hoje ?? []}
                    pedidosHoje={dadosBackend?.pedidos_hoje ?? []}
                />

                <PerformanceSection 
                    intervaloData={intervaloData}
                    setDataInicioFiltro={setDataInicioFiltro}
                    metricas={dadosBackend?.metricas}
                />

                <GraficosSection 
                    charts={dadosBackend?.charts}
                    metricas={dadosBackend?.metricas}
                />
            </div>
        </LayoutAutenticado>
    );
}
