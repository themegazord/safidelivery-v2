import AdicionarEnderecoNovo from "@/components/Empresa/CardapioDigital/Modais/FinalizarPedido/AdicionarEnderecoNovo";
import AlteraEnderecoPrincipal from "@/components/Empresa/CardapioDigital/Modais/FinalizarPedido/AlteraEnderecoPrincipal";
import CupomPedido from "@/components/Empresa/FinalizarPedido/Cards/CupomPedido";
import DadosEntrega from "@/components/Empresa/FinalizarPedido/Cards/DadosEntrega";
import FinalizarPedidoHeader from "@/components/Empresa/FinalizarPedido/Cards/FinalizarPedidoHeader";
import ResumoPedido from "@/components/Empresa/FinalizarPedido/Cards/ResumoPedido";
import SelecaoFormaPagamento from "@/components/Empresa/FinalizarPedido/Cards/SelecaoFormaPagamento";
import { CarrinhoContext } from "@/contexts/CardapioDigital/CarrinhoContext";
import LayoutCardapio from "@/Layouts/LayoutCardapio";
import { IAuth } from "@/types/usuario-autenticado/usuario";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { ReactNode, useContext, useEffect, useState } from "react";

export interface IDadosDistanciaRota {
    dadosDistanciaRota: {
        duracao: string,
        latCliente: string,
        lngCliente: string,
        taxaFrete: number | null,
        valorMaximoDesconto: boolean
    },
    foraAreaEntrega: boolean
}

export type TFormaPagamento = {
    value: number,
    label: string,
    tipo: string
}

export default function FinalizarPedido() {
    const { interacao_id, tipo_funcionamento, nome_fantasia, auth, mesa, enderecoFormatadoEmpresa, configuracoes, formasPagamentos } = usePage<{
        interacao_id: string;
        tipo_funcionamento: 'delivery' | 'retirada' | 'mesa';
        auth: IAuth,
        mesa: number | undefined,
        nome_fantasia: string,
        enderecoFormatadoEmpresa: string,
        configuracoes: Record<string, string>,
        formasPagamentos: TFormaPagamento[]
    }>().props;
    const [tipoEntrega, setTipoEntrega] = useState<'delivery' | 'retirada' | 'mesa'>(tipo_funcionamento)
    const [numeroMesa, setNumeroMesa] = useState<number | undefined>(mesa)
    const [formaPagamento, setFormaPagamento] = useState<string | undefined>(undefined)
    const [cupomPedido, setCupomPedido] = useState<string | undefined>(undefined)
    const [dadosDistanciaRota, setDadosDistaciaRota] = useState< IDadosDistanciaRota | null>(null)
    const [erroEntrega, setErroEntrega] = useState<string | null>(null)
    const [toggleAlteraEnderecoPrincipal, setToggleAlteraEnderecoPrincipal] = useState<boolean>(false)
    const [toggleCadastraEnderecoNovo, setToggleCadastraEnderecoNovo] = useState<boolean>(false)
    const [totalPedido, setTotalPedido] = useState<number | undefined>(undefined)
    const { carrinho, total } = useContext(CarrinhoContext)

    useEffect(() => {
        async function carregaDadosEntrega() {
            await axios.post(route('aplicacao.empresa.finalizar-pedido.consulta-dados-rota'), {
                enderecoFormatadoEmpresa,
                interacao_id,
                configuracoes,
                subtotalPedido: total
            })
            .then((response) => {
                setDadosDistaciaRota(response.data)
                setErroEntrega(null)
            })
            .catch((error) => {
                if (error.response?.status === 422) {
                    setErroEntrega(error.response.data.message)
                    setDadosDistaciaRota(null)
                }
            })
        }

        carregaDadosEntrega()
    }, [auth.user?.cliente.endereco?.id])

    useEffect(() => {
        setTotalPedido((dadosDistanciaRota?.dadosDistanciaRota.taxaFrete ?? 0) + total)
    }, [dadosDistanciaRota?.dadosDistanciaRota.taxaFrete, total])

    useEffect(() => {
        
    }, [cupomPedido])

    return (
        <div className="bg-background/20 min-h-screen">
            <div className="flex flex-col gap-4 mx-auto max-w-7xl px-4 py-8">
                <FinalizarPedidoHeader />
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <DadosEntrega 
                            auth={auth}
                            tipo_funcionamento={tipo_funcionamento}
                            numeroMesa={numeroMesa}
                            erroEntrega={erroEntrega}
                            dadosDistanciaRota={dadosDistanciaRota}
                            configuracoes={configuracoes}
                            total={total}
                            setTipoEntrega={setTipoEntrega}
                            setNumeroMesa={setNumeroMesa}
                            setToggleAlteraEnderecoPrincipal={setToggleAlteraEnderecoPrincipal}
                            setToggleCadastraEnderecoNovo={setToggleCadastraEnderecoNovo}
                        />
                        {tipo_funcionamento !== 'mesa' && (
                            <>
                                <SelecaoFormaPagamento formasPagamentos={formasPagamentos} formaPagamento={formaPagamento} setFormaPagamento={setFormaPagamento} />
                                {/*TODO: Finalizar a rotina de cupom depois de finalizar o CRUD */}
                                <CupomPedido cupomPedido={cupomPedido} setCupomPedido={setCupomPedido}/>
                            </>
                        )}
                    </div>
                    <ResumoPedido carrinho={carrinho} tipo_funcionamento={tipo_funcionamento} nome_fantasia={nome_fantasia} interacao_id={interacao_id} taxa_entrega={dadosDistanciaRota?.dadosDistanciaRota.taxaFrete ?? 0} subtotal={total} total={totalPedido ?? 0}  lista/>
                </div>
            </div>
            <AlteraEnderecoPrincipal open={toggleAlteraEnderecoPrincipal} setOpen={setToggleAlteraEnderecoPrincipal} auth={auth}/>
            <AdicionarEnderecoNovo open={toggleCadastraEnderecoNovo} setOpen={setToggleCadastraEnderecoNovo} />
        </div>
    );
}

FinalizarPedido.layout = (page: ReactNode) => (
    <LayoutCardapio>{page}</LayoutCardapio>
);
