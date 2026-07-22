import AdicionarEnderecoNovo from "@/components/Empresa/CardapioDigital/Modais/FinalizarPedido/AdicionarEnderecoNovo";
import AlteraEnderecoPrincipal from "@/components/Empresa/CardapioDigital/Modais/FinalizarPedido/AlteraEnderecoPrincipal";
import CupomPedido from "@/components/Empresa/FinalizarPedido/Cards/CupomPedido";
import DadosEntrega from "@/components/Empresa/FinalizarPedido/Cards/DadosEntrega";
import FinalizarPedidoHeader from "@/components/Empresa/FinalizarPedido/Cards/FinalizarPedidoHeader";
import ObsersavaoPedido from "@/components/Empresa/FinalizarPedido/Cards/ObservacaoPedido";
import ResumoPedido from "@/components/Empresa/FinalizarPedido/Cards/ResumoPedido";
import SelecaoFormaPagamento from "@/components/Empresa/FinalizarPedido/Cards/SelecaoFormaPagamento";
import { CarrinhoContext } from "@/contexts/CardapioDigital/CarrinhoContext";
import LayoutCardapio from "@/Layouts/LayoutCardapio";
import { IAuth } from "@/types/usuario-autenticado/usuario";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { ReactNode, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

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
    const { interacao_id, tipo_funcionamento, nome_fantasia, auth, mesa, enderecoFormatadoEmpresa, configuracoes, formasPagamentos, nome, telefone } = usePage<{
        interacao_id: string;
        tipo_funcionamento: 'delivery' | 'retirada' | 'mesa';
        auth: IAuth,
        mesa: number | undefined,
        nome_fantasia: string,
        enderecoFormatadoEmpresa: string,
        configuracoes: Record<string, string>,
        formasPagamentos: TFormaPagamento[], 
        nome: string | null,
        telefone: string | null
    }>().props;
    const [tipoEntrega, setTipoEntrega] = useState<'delivery' | 'retirada' | 'mesa'>(tipo_funcionamento)
    const [numeroMesa, setNumeroMesa] = useState<number | undefined>(mesa)
    const [formaPagamento, setFormaPagamento] = useState<string | undefined>(undefined)
    const [cupomPedido, setCupomPedido] = useState<string | undefined>(undefined)
    const [observacaoPedido, setObservacaoPedido] = useState<string | undefined>(undefined)
    const [dadosDistanciaRota, setDadosDistaciaRota] = useState< IDadosDistanciaRota | null>(null)
    const [erroEntrega, setErroEntrega] = useState<string | null>(null)
    const [toggleAlteraEnderecoPrincipal, setToggleAlteraEnderecoPrincipal] = useState<boolean>(false)
    const [toggleCadastraEnderecoNovo, setToggleCadastraEnderecoNovo] = useState<boolean>(false)
    const [isFinalizando, setIsFinalizando] = useState<boolean>(false)
    const { carrinho, subtotal, calculaTotal, total } = useContext(CarrinhoContext)

    useEffect(() => {
        async function carregaDadosEntrega() {
            await axios.post(route('aplicacao.empresa.finalizar-pedido.consulta-dados-rota'), {
                enderecoFormatadoEmpresa,
                interacao_id,
                configuracoes,
                subtotalPedido: subtotal
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
        calculaTotal((dadosDistanciaRota?.dadosDistanciaRota.taxaFrete ?? 0), null)
    }, [dadosDistanciaRota?.dadosDistanciaRota.taxaFrete, subtotal])

    {/*TODO: Finalizar a rotina de cupom depois de finalizar o CRUD */}
    useEffect(() => {
        
    }, [cupomPedido])

    async function finalizarPedido() {
        if (isFinalizando) return;
        setIsFinalizando(true);

        try {
            await axios.post(route('aplicacao.empresa.finalizar-pedido.store'), {
                pedido: carrinho,
                forma_pagamento: formaPagamento,
                frete: dadosDistanciaRota?.dadosDistanciaRota.taxaFrete,
                subtotal: subtotal,
                total: total,
                observacao: observacaoPedido,
                cliente: auth.user?.cliente,
                tipo_funcionamento: tipo_funcionamento,
                interacao_id: interacao_id,
                configuracoes: configuracoes,
                mesa: numeroMesa,
                nome_cliente: nome,
                telefone_cliente: telefone,
            });

            toast.success('Pedido realizado com sucesso!');
            router.visit(route('aplicacao.empresa.cardapio-digital', { interacao_id, tipo_funcionamento }));
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const mensagem = error.response?.data?.mensagem ?? 'Erro ao realizar pedido. Tente novamente.';
                toast.error(mensagem);
            } else {
                toast.error('Erro inesperado. Tente novamente.');
            }
        } finally {
            setIsFinalizando(false);
        }
    }

    return (
        <div className="bg-background/20 min-h-screen">
            <div className="flex flex-col gap-4 mx-auto max-w-7xl px-4 py-8">
                <FinalizarPedidoHeader />
                <div className="grid gap-8 lg:grid-cols-3 items-start">
                    <div className="space-y-6 lg:col-span-2">
                        <DadosEntrega
                            auth={auth}
                            tipo_funcionamento={tipo_funcionamento}
                            numeroMesa={numeroMesa}
                            erroEntrega={erroEntrega}
                            dadosDistanciaRota={dadosDistanciaRota}
                            configuracoes={configuracoes}
                            subtotal={subtotal}
                            nome={nome}
                            telefone={telefone}
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
                                {/*TODO: Finalizar a rotina de cashback depois de finalizar o CRUD */}
                                <ObsersavaoPedido observacaoPedido={observacaoPedido} setObservacaoPedido={setObservacaoPedido}/>
                            </>
                        )}
                    </div>
                    <ResumoPedido carrinho={carrinho} tipo_funcionamento={tipo_funcionamento} nome_fantasia={nome_fantasia} interacao_id={interacao_id} taxa_entrega={dadosDistanciaRota?.dadosDistanciaRota.taxaFrete ?? 0} subtotal={subtotal} total={total} isFinalizando={isFinalizando} realizarPedido={finalizarPedido} lista/>
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
