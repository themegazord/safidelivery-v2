import AdicionarEnderecoNovo from "@/components/Empresa/CardapioDigital/Modais/FinalizarPedido/AdicionarEnderecoNovo";
import AlteraEnderecoPrincipal from "@/components/Empresa/CardapioDigital/Modais/FinalizarPedido/AlteraEnderecoPrincipal";
import CashbackGeradoDialog from "@/components/Empresa/FinalizarPedido/Modais/CashbackGeradoDialog";
import CashbackPedido from "@/components/Empresa/FinalizarPedido/Cards/CashbackPedido";
import CupomPedido from "@/components/Empresa/FinalizarPedido/Cards/CupomPedido";
import DadosEntrega from "@/components/Empresa/FinalizarPedido/Cards/DadosEntrega";
import FidelidadePedido from "@/components/Empresa/FinalizarPedido/Cards/FidelidadePedido";
import FinalizarPedidoHeader from "@/components/Empresa/FinalizarPedido/Cards/FinalizarPedidoHeader";
import ModalEscolherPremio from "@/components/Empresa/FinalizarPedido/Modais/ModalEscolherPremio";
import ObsersavaoPedido from "@/components/Empresa/FinalizarPedido/Cards/ObservacaoPedido";
import ResumoPedido from "@/components/Empresa/FinalizarPedido/Cards/ResumoPedido";
import SelecaoFormaPagamento from "@/components/Empresa/FinalizarPedido/Cards/SelecaoFormaPagamento";
import { CarrinhoContext } from "@/contexts/CardapioDigital/CarrinhoContext";
import LayoutCardapio from "@/Layouts/LayoutCardapio";
import { ICupomAplicado, ICupomVisivel } from "@/types/finalizar-pedido/cupom";
import {
    IProgressoFidelidade,
    IRecompensaFidelidade,
    IResgateFidelidade,
} from "@/types/finalizar-pedido/fidelidade";
import { IAuth } from "@/types/usuario-autenticado/usuario";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
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

export type TPagamentoMultiplo = {
    forma_pagamento_id: string | undefined,
    valor: string,
    troco_para: string,
}

export default function FinalizarPedido() {
    const { interacao_id, tipo_funcionamento, nome_fantasia, auth, mesa, enderecoFormatadoEmpresa, configuracoes, formasPagamentos, nome, telefone, cupomDesconto, cuponsVisiveis, cashbackDisponivel, progressoFidelidade, recompensaFidelidade } = usePage<{
        interacao_id: string;
        tipo_funcionamento: 'delivery' | 'retirada' | 'mesa';
        auth: IAuth,
        mesa: number | undefined,
        nome_fantasia: string,
        enderecoFormatadoEmpresa: string,
        configuracoes: Record<string, string>,
        formasPagamentos: TFormaPagamento[],
        nome: string | null,
        telefone: string | null,
        cupomDesconto: string | null,
        cuponsVisiveis: ICupomVisivel[],
        cashbackDisponivel: number,
        progressoFidelidade: IProgressoFidelidade | null,
        recompensaFidelidade: IRecompensaFidelidade | null,
    }>().props;
    const [tipoEntrega, setTipoEntrega] = useState<'delivery' | 'retirada' | 'mesa'>(tipo_funcionamento)
    const [numeroMesa, setNumeroMesa] = useState<number | undefined>(mesa)
    const [formaPagamento, setFormaPagamento] = useState<string | undefined>(undefined)
    const [trocoPara, setTrocoPara] = useState<number | undefined>(undefined)
    const [usarMultiplasFormas, setUsarMultiplasFormas] = useState<boolean>(false)
    const [pagamentosMultiplos, setPagamentosMultiplos] = useState<TPagamentoMultiplo[]>([])
    const [cupomPedido, setCupomPedido] = useState<string | undefined>(cupomDesconto ?? undefined)
    const [cupomAplicado, setCupomAplicado] = useState<ICupomAplicado | null>(null)
    const [validandoCupom, setValidandoCupom] = useState<boolean>(false)
    const [usarCashback, setUsarCashback] = useState<boolean>(false)
    const [resgateFidelidade, setResgateFidelidade] = useState<IResgateFidelidade | null>(null)
    const [modalPremioAberto, setModalPremioAberto] = useState<boolean>(false)
    const [modalCashbackAberto, setModalCashbackAberto] = useState<boolean>(false)
    const [cashbackGerado, setCashbackGerado] = useState<number>(0)
    const [aguardandoPix, setAguardandoPix] = useState<boolean>(false)
    const [observacaoPedido, setObservacaoPedido] = useState<string | undefined>(undefined)
    const [dadosDistanciaRota, setDadosDistaciaRota] = useState< IDadosDistanciaRota | null>(null)
    const [erroEntrega, setErroEntrega] = useState<string | null>(null)
    const [toggleAlteraEnderecoPrincipal, setToggleAlteraEnderecoPrincipal] = useState<boolean>(false)
    const [toggleCadastraEnderecoNovo, setToggleCadastraEnderecoNovo] = useState<boolean>(false)
    const [isFinalizando, setIsFinalizando] = useState<boolean>(false)
    const cupomDaSessaoAplicado = useRef(false)
    const { carrinho, subtotal, calculaTotal, total, limparCarrinho } = useContext(CarrinhoContext)

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
                    setErroEntrega(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
                    setDadosDistaciaRota(null)
                }
            })
        }

        carregaDadosEntrega()
    }, [auth.user?.cliente.endereco?.id])

    const taxaFrete = dadosDistanciaRota?.dadosDistanciaRota.taxaFrete ?? 0
    const descontoCupom = cupomAplicado?.valor_desconto_calculado ?? 0
    const cashbackAUsar = usarCashback
        ? Math.min(cashbackDisponivel, Math.max(0, subtotal + taxaFrete - descontoCupom))
        : 0

    useEffect(() => {
        calculaTotal(taxaFrete, descontoCupom + cashbackAUsar)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taxaFrete, subtotal, descontoCupom, cashbackAUsar])

    const pagaEmDinheiro = formasPagamentos?.find((fp) => String(fp.value) === formaPagamento)?.tipo === 'DIN'

    useEffect(() => {
        setTrocoPara(undefined)
    }, [formaPagamento])

    async function aplicarCupom(nomeCupom: string) {
        setValidandoCupom(true)

        await axios.post(route('aplicacao.empresa.finalizar-pedido.valida-cupom-pedido'), {
            cupom: nomeCupom,
            subtotal: subtotal,
            frete: dadosDistanciaRota?.dadosDistanciaRota.taxaFrete ?? null,
            interacao_id: interacao_id,
        })
        .then((response) => {
            setCupomAplicado(response.data.cupom)
            toast.success('Cupom aplicado com sucesso!')
        })
        .catch((error) => {
            setCupomAplicado(null)
            toast.error(error.response?.data?.mensagem ?? 'Não foi possível validar o cupom.')
        })
        .finally(() => setValidandoCupom(false))
    }

    function removerCupom() {
        setCupomAplicado(null)
        setCupomPedido(undefined)
    }

    function resgatarFidelidade() {
        if (!recompensaFidelidade) return

        if (recompensaFidelidade.tipo === 'item_gratis') {
            setModalPremioAberto(true)
            return
        }

        setResgateFidelidade({ usar: true })
        toast.success('Recompensa será aplicada ao finalizar o pedido!')
    }

    useEffect(() => {
        if (cupomDesconto && tipo_funcionamento !== 'mesa' && !cupomDaSessaoAplicado.current) {
            cupomDaSessaoAplicado.current = true
            aplicarCupom(cupomDesconto)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cupomDesconto])

    async function finalizarPedido() {
        if (isFinalizando) return;

        if (!usarMultiplasFormas && pagaEmDinheiro && trocoPara !== undefined && trocoPara < total) {
            toast.error(`O valor para troco deve ser maior ou igual ao total do pedido (R$ ${total.toFixed(2).replace(".", ",")}).`);
            return;
        }

        if (usarMultiplasFormas) {
            if (pagamentosMultiplos.some((p) => !p.forma_pagamento_id || !p.valor || Number(p.valor) <= 0)) {
                toast.error("Selecione a forma de pagamento e informe o valor em todas as entradas.");
                return;
            }

            const somaPagamentos = pagamentosMultiplos.reduce((acc, p) => acc + Number(p.valor), 0);
            if (Math.abs(somaPagamentos - total) > 0.01) {
                toast.error("A soma dos valores das formas de pagamento deve ser igual ao total do pedido.");
                return;
            }

            const linhaComTrocoInsuficiente = pagamentosMultiplos.some((p) => {
                if (!p.troco_para) return false;
                return Number(p.troco_para) < Number(p.valor);
            });
            if (linhaComTrocoInsuficiente) {
                toast.error("O valor do troco deve ser maior ou igual ao valor informado na respectiva forma de pagamento.");
                return;
            }
        }

        setIsFinalizando(true);

        try {
            const response = await axios.post(route('aplicacao.empresa.finalizar-pedido.store'), {
                pedido: carrinho,
                forma_pagamento: usarMultiplasFormas ? undefined : formaPagamento,
                troco_para: !usarMultiplasFormas && pagaEmDinheiro ? trocoPara : undefined,
                pagamentos: usarMultiplasFormas
                    ? pagamentosMultiplos.map((p) => ({
                          forma_pagamento_id: Number(p.forma_pagamento_id),
                          valor: Number(p.valor),
                          troco_para: p.troco_para ? Number(p.troco_para) : undefined,
                      }))
                    : undefined,
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
                cupom: cupomAplicado?.nome_cupom,
                usar_cashback: usarCashback,
                resgate_fidelidade: resgateFidelidade,
            });

            limparCarrinho();

            const cashbackGeradoPedido = response.data?.cashback_gerado ?? 0;
            const pedidoAguardandoPix = response.data?.status === 'confirmar pix';

            toast.success(
                pedidoAguardandoPix
                    ? 'Pedido realizado! Copie o código Pix em Meus pedidos para pagar.'
                    : 'Pedido realizado com sucesso!'
            );

            if (cashbackGeradoPedido > 0) {
                setCashbackGerado(cashbackGeradoPedido);
                setAguardandoPix(pedidoAguardandoPix);
                setModalCashbackAberto(true);
                return;
            }

            redirecionaAposPedido(pedidoAguardandoPix);
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

    function redirecionaAposPedido(pix: boolean) {
        router.visit(pix
            ? route('aplicacao.cliente.meus-pedidos')
            : route('aplicacao.empresa.cardapio-digital', { interacao_id, tipo_funcionamento }));
    }

    function continuarAposCashback() {
        setModalCashbackAberto(false);
        redirecionaAposPedido(aguardandoPix);
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
                                <SelecaoFormaPagamento
                                    formasPagamentos={formasPagamentos}
                                    formaPagamento={formaPagamento}
                                    setFormaPagamento={setFormaPagamento}
                                    total={total}
                                    trocoPara={trocoPara}
                                    setTrocoPara={setTrocoPara}
                                    multiplasFormasHabilitado={Boolean(Number(configuracoes.multiplas_formas_pagamento ?? '0'))}
                                    usarMultiplasFormas={usarMultiplasFormas}
                                    setUsarMultiplasFormas={setUsarMultiplasFormas}
                                    pagamentosMultiplos={pagamentosMultiplos}
                                    setPagamentosMultiplos={setPagamentosMultiplos}
                                />
                                <CupomPedido
                                    cupomPedido={cupomPedido}
                                    setCupomPedido={setCupomPedido}
                                    cupomAplicado={cupomAplicado}
                                    cuponsVisiveis={cuponsVisiveis}
                                    validandoCupom={validandoCupom}
                                    onAplicar={aplicarCupom}
                                    onRemover={removerCupom}
                                />
                                <CashbackPedido
                                    cashbackDisponivel={cashbackDisponivel}
                                    usarCashback={usarCashback}
                                    setUsarCashback={setUsarCashback}
                                />
                                <FidelidadePedido
                                    progressoFidelidade={progressoFidelidade}
                                    recompensaFidelidade={recompensaFidelidade}
                                    resgatado={!!resgateFidelidade}
                                    onResgatar={resgatarFidelidade}
                                />
                                <ObsersavaoPedido observacaoPedido={observacaoPedido} setObservacaoPedido={setObservacaoPedido}/>
                            </>
                        )}
                    </div>
                    <ResumoPedido carrinho={carrinho} tipo_funcionamento={tipo_funcionamento} nome_fantasia={nome_fantasia} interacao_id={interacao_id} taxa_entrega={dadosDistanciaRota?.dadosDistanciaRota.taxaFrete ?? 0} subtotal={subtotal} desconto={descontoCupom} cashbackUtilizado={cashbackAUsar} recompensaFidelidadeResgatada={!!resgateFidelidade} total={total} isFinalizando={isFinalizando} realizarPedido={finalizarPedido} lista/>
                </div>
            </div>
            <AlteraEnderecoPrincipal open={toggleAlteraEnderecoPrincipal} setOpen={setToggleAlteraEnderecoPrincipal} auth={auth}/>
            <AdicionarEnderecoNovo open={toggleCadastraEnderecoNovo} setOpen={setToggleCadastraEnderecoNovo} />
            <ModalEscolherPremio
                aberto={modalPremioAberto}
                onOpenChange={setModalPremioAberto}
                interacaoId={interacao_id}
                onConfirmar={(resgate) => {
                    setResgateFidelidade(resgate)
                    toast.success('Prêmio escolhido! Ele será adicionado ao seu pedido.')
                }}
            />
            <CashbackGeradoDialog
                aberto={modalCashbackAberto}
                cashbackGerado={cashbackGerado}
                onContinuar={continuarAposCashback}
            />
        </div>
    );
}

FinalizarPedido.layout = (page: ReactNode) => (
    <LayoutCardapio>{page}</LayoutCardapio>
);
