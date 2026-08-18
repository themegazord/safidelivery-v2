import { useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import KanbanBoard from "@/components/Empresa/Pedidos/KanbanBoard";
import PedidoDetalhesDialog from "@/components/Empresa/Pedidos/PedidoDetalhesDialog";
import ClienteHistoricoDialog from "@/components/Empresa/Pedidos/ClienteHistoricoDialog";
import CancelarPedidoDialog, { IMotivoCancelamentoIfood } from "@/components/Empresa/Pedidos/CancelarPedidoDialog";
import ConfirmarEntregaDialog from "@/components/Empresa/Pedidos/ConfirmarEntregaDialog";
import NotificacoesDrawer from "@/components/Empresa/Pedidos/NotificacoesDrawer";
import { useSomAlerta } from "@/hooks/useSomAlerta";
import { transicaoValida, proximoStatus } from "@/utils/pedidos";
import {
    IConfiguracoesPedidos,
    IHistoricoCliente,
    INotificacao,
    IPedido,
    TStatusPedido,
} from "@/types/empresa/pedidos/types";
import { Bell, ListOrdered } from "lucide-react";

interface IProps {
    pedidos: IPedido[];
    notificacoes: INotificacao[];
    disputasPendentes: number[];
    settlements: Record<string, string | null>;
    configuracoes: IConfiguracoesPedidos;
    timezone: string;
}

export default function Kanban({
    pedidos: pedidosIniciais,
    notificacoes: notificacoesIniciais,
    disputasPendentes: disputasPendentesIniciais,
    settlements: settlementsIniciais,
    configuracoes: configuracoesIniciais,
    timezone,
}: IProps) {
    const { cnpj } = usePage<{ cnpj: string }>().props;
    const { tocar: tocarSom } = useSomAlerta("/sons/alerta.mp3");

    const [pedidos, setPedidos] = useState<IPedido[]>(pedidosIniciais);
    const [notificacoes, setNotificacoes] = useState<INotificacao[]>(notificacoesIniciais);
    const [settlements, setSettlements] = useState<Record<string, string | null>>(settlementsIniciais);
    const [configuracoes, setConfiguracoes] = useState<IConfiguracoesPedidos>(configuracoesIniciais);
    const [salvandoConfig, setSalvandoConfig] = useState<string | null>(null);
    const [avancandoId, setAvancandoId] = useState<number | null>(null);

    const disputasJaNotificadas = useRef<Set<number>>(new Set());
    // Guarda status aplicados otimisticamente (com validade curta) pra o polling
    // de 5s não sobrescrever com dado desatualizado enquanto o PATCH ainda não
    // terminou (ou já terminou mas o poll em andamento foi disparado antes).
    const statusOtimista = useRef<Map<number, { status: TStatusPedido; expiraEm: number }>>(new Map());

    const [pedidoDetalhe, setPedidoDetalhe] = useState<IPedido | undefined>();
    const [loadingDetalhe, setLoadingDetalhe] = useState(false);
    const [modalDetalheOpen, setModalDetalheOpen] = useState(false);

    const [pedidoPassado, setPedidoPassado] = useState<IPedido | undefined>();
    const [loadingPassado, setLoadingPassado] = useState(false);
    const [modalPassadoOpen, setModalPassadoOpen] = useState(false);

    const [historicoCliente, setHistoricoCliente] = useState<IHistoricoCliente | undefined>();
    const [loadingHistorico, setLoadingHistorico] = useState(false);
    const [modalHistoricoOpen, setModalHistoricoOpen] = useState(false);
    const [paginaHistorico, setPaginaHistorico] = useState(1);

    const [pedidoParaCancelar, setPedidoParaCancelar] = useState<IPedido | undefined>();
    const [motivosCancelamento, setMotivosCancelamento] = useState<IMotivoCancelamentoIfood[] | null>(null);
    const [carregandoMotivos, setCarregandoMotivos] = useState(false);
    const [modalCancelamentoOpen, setModalCancelamentoOpen] = useState(false);
    const [loadingCancelamento, setLoadingCancelamento] = useState(false);

    const [pedidoParaConfirmarEntrega, setPedidoParaConfirmarEntrega] = useState<IPedido | undefined>();
    const [modalConfirmarEntregaOpen, setModalConfirmarEntregaOpen] = useState(false);
    const [loadingConfirmarEntrega, setLoadingConfirmarEntrega] = useState(false);

    const [drawerNotificacoesOpen, setDrawerNotificacoesOpen] = useState(false);
    const [baixandoEvidenciasId, setBaixandoEvidenciasId] = useState<number | null>(null);
    const [enviandoNegociacao, setEnviandoNegociacao] = useState(false);

    const notificacoesNaoLidas = notificacoes.filter((n) => !n.lida).length;

    // Polling: pedidos novos (a cada 5s, mirror do wire:poll.5s="verificaPedidosNovos")
    useEffect(() => {
        const intervalo = setInterval(async () => {
            try {
                const { data } = await axios.get(route("aplicacao.empresa.pedidos.verifica-novos", { cnpj }));
                const agora = Date.now();
                setPedidos(
                    (data.pedidos as IPedido[]).map((novo) => {
                        const override = statusOtimista.current.get(novo.id);
                        if (override && override.expiraEm > agora) {
                            return { ...novo, status: override.status };
                        }
                        return novo;
                    }),
                );
                if (data.tocar_som) tocarSom();
            } catch {
                // silencioso: próxima checagem tenta de novo
            }
        }, 5000);
        return () => clearInterval(intervalo);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Polling: notificações (a cada 5s, mirror do wire:poll.5s="atualizaNotificacoes")
    useEffect(() => {
        const intervalo = setInterval(async () => {
            try {
                const { data } = await axios.get(route("aplicacao.empresa.pedidos.notificacoes.index", { cnpj }));
                setNotificacoes(data.notificacoes);
                setSettlements(data.settlements);

                const novasDisputas: number[] = data.disputasPendentes.filter(
                    (id: number) => !disputasJaNotificadas.current.has(id),
                );
                if (novasDisputas.length > 0) {
                    novasDisputas.forEach((id) => disputasJaNotificadas.current.add(id));
                    toast.error("⚠ Disputa iFood pendente", {
                        description: "Abra as notificações para decidir",
                        duration: Infinity,
                    });
                }
            } catch {
                // silencioso
            }
        }, 5000);
        return () => clearInterval(intervalo);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        disputasPendentesIniciais.forEach((id) => disputasJaNotificadas.current.add(id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function atualizaPedidoLocal(pedidoAtualizado: IPedido) {
        setPedidos((prev) => prev.map((p) => (p.id === pedidoAtualizado.id ? { ...p, ...pedidoAtualizado } : p)));
    }

    async function abrirDetalhes(pedidoId: number) {
        setModalDetalheOpen(true);
        setLoadingDetalhe(true);
        await axios
            .get(route("aplicacao.empresa.pedidos.show", { cnpj, pedido_id: pedidoId }))
            .then((response) => setPedidoDetalhe(response.data.pedido))
            .catch(() => toast.error("Erro ao carregar o pedido"))
            .finally(() => setLoadingDetalhe(false));
    }

    async function moverStatus(pedido: IPedido, novoStatus: TStatusPedido) {
        if (!transicaoValida(pedido.status, novoStatus)) {
            toast.error(`Transição inválida: ${pedido.status} → ${novoStatus}`);
            return;
        }

        // Confirmação de entrega (pedido não-iFood) só aplica depois que o usuário
        // confirmar no modal — não move o card otimisticamente nesse caso.
        const precisaConfirmar = pedido.pedido_ifood_id === null && novoStatus === "entregue";
        const statusAnterior = pedido.status;

        if (!precisaConfirmar) {
            statusOtimista.current.set(pedido.id, { status: novoStatus, expiraEm: Date.now() + 8000 });
            setPedidos((prev) => prev.map((p) => (p.id === pedido.id ? { ...p, status: novoStatus } : p)));
        }

        setAvancandoId(pedido.id);
        await axios
            .patch(route("aplicacao.empresa.pedidos.status", { cnpj, pedido_id: pedido.id }), { novo_status: novoStatus })
            .then((response) => {
                if (response.data.requer_confirmacao) {
                    statusOtimista.current.delete(pedido.id);
                    setPedidoParaConfirmarEntrega(response.data.pedido);
                    setModalConfirmarEntregaOpen(true);
                    return;
                }
                statusOtimista.current.delete(pedido.id);
                atualizaPedidoLocal(response.data.pedido);
                if (pedidoDetalhe?.id === pedido.id) setPedidoDetalhe(response.data.pedido);
            })
            .catch((error) => {
                if (!precisaConfirmar) {
                    statusOtimista.current.delete(pedido.id);
                    setPedidos((prev) => prev.map((p) => (p.id === pedido.id ? { ...p, status: statusAnterior } : p)));
                }
                toast.error(error.response?.data?.message ?? "Erro ao atualizar status");
            })
            .finally(() => setAvancandoId(null));
    }

    function avancarPedido(pedido: IPedido) {
        moverStatus(pedido, proximoStatus(pedido));
    }

    async function abrirCancelamento(pedido: IPedido) {
        setPedidoParaCancelar(pedido);
        setModalCancelamentoOpen(true);
        setMotivosCancelamento(null);

        if (pedido.pedido_ifood_id) {
            setCarregandoMotivos(true);
            await axios
                .get(route("aplicacao.empresa.pedidos.motivos-cancelamento-ifood", { cnpj, pedido_id: pedido.id }))
                .then((response) => setMotivosCancelamento(response.data.motivos))
                .catch(() => toast.error("Erro ao carregar os motivos de cancelamento"))
                .finally(() => setCarregandoMotivos(false));
        }
    }

    async function confirmarCancelamento(dados: { motivo_codigo: string; motivo_descricao: string } | { mensagem: string }) {
        if (!pedidoParaCancelar) return;
        setLoadingCancelamento(true);
        await axios
            .post(route("aplicacao.empresa.pedidos.cancelar", { cnpj, pedido_id: pedidoParaCancelar.id }), dados)
            .then((response) => {
                toast.success(response.data.mensagem);
                setModalCancelamentoOpen(false);
                setModalDetalheOpen(false);
                setAvancandoId(null);
                axios
                    .get(route("aplicacao.empresa.pedidos.verifica-novos", { cnpj }))
                    .then((r) => setPedidos(r.data.pedidos));
            })
            .catch((error) => toast.error(error.response?.data?.message ?? "Erro ao cancelar o pedido"))
            .finally(() => setLoadingCancelamento(false));
    }

    async function confirmarEntregaPedido() {
        if (!pedidoParaConfirmarEntrega) return;
        setLoadingConfirmarEntrega(true);
        await axios
            .post(route("aplicacao.empresa.pedidos.confirmar-entrega", { cnpj, pedido_id: pedidoParaConfirmarEntrega.id }))
            .then((response) => {
                toast.success(response.data.mensagem);
                atualizaPedidoLocal(response.data.pedido);
                setModalConfirmarEntregaOpen(false);
            })
            .catch((error) => toast.error(error.response?.data?.message ?? "Erro ao confirmar entrega"))
            .finally(() => setLoadingConfirmarEntrega(false));
    }

    async function abrirHistoricoCliente(page = 1) {
        if (!pedidoDetalhe?.cliente?.id) return;
        setModalHistoricoOpen(true);
        setLoadingHistorico(true);
        setPaginaHistorico(page);
        await axios
            .get(route("aplicacao.empresa.pedidos.cliente.historico", { cnpj, cliente_id: pedidoDetalhe.cliente.id }), {
                params: { page },
            })
            .then((response) => setHistoricoCliente(response.data))
            .catch(() => toast.error("Erro ao carregar o histórico do cliente"))
            .finally(() => setLoadingHistorico(false));
    }

    async function abrirPedidoPassado(pedidoId: number) {
        setModalPassadoOpen(true);
        setLoadingPassado(true);
        await axios
            .get(route("aplicacao.empresa.pedidos.show", { cnpj, pedido_id: pedidoId }))
            .then((response) => setPedidoPassado(response.data.pedido))
            .catch(() => toast.error("Erro ao carregar o pedido"))
            .finally(() => setLoadingPassado(false));
    }

    async function imprimirPedido(pedidoId: number) {
        await axios
            .get(route("aplicacao.empresa.pedidos.url-impressao", { cnpj, pedido_id: pedidoId }))
            .then((response) => window.open(response.data.url, "_blank"))
            .catch(() => toast.error("Erro ao gerar a impressão do pedido"));
    }

    async function toggleConfig(chave: "aceite_automatico" | "aceite_automatico_ifood", valor: boolean) {
        setConfiguracoes((prev) => ({ ...prev, [chave]: valor }));
        setSalvandoConfig(chave);
        await axios
            .patch(route("aplicacao.empresa.pedidos.configuracao", { cnpj }), { chave, valor })
            .catch(() => {
                setConfiguracoes((prev) => ({ ...prev, [chave]: !valor }));
                toast.error("Erro ao salvar a configuração");
            })
            .finally(() => setSalvandoConfig(null));
    }

    async function abrirNotificacoes() {
        setDrawerNotificacoesOpen(true);
        const ids = notificacoes.filter((n) => !n.lida).map((n) => n.id);
        if (ids.length === 0) return;
        await axios.post(route("aplicacao.empresa.pedidos.notificacoes.marcar-lidas", { cnpj }), { ids }).then(() => {
            setNotificacoes((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, lida: true } : n)));
        });
    }

    async function verEvidencias(notificacaoId: number) {
        setBaixandoEvidenciasId(notificacaoId);
        await axios
            .get(route("aplicacao.empresa.pedidos.notificacoes.evidencias", { cnpj, notificacao_id: notificacaoId }), {
                responseType: "blob",
            })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                link.download = `evidencias-${notificacaoId}.zip`;
                link.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(() => toast.error("Não foi possível montar o ZIP de evidências"))
            .finally(() => setBaixandoEvidenciasId(null));
    }

    async function enviarNegociacao(notificacao: INotificacao, tipoProposta: string, negociacao: Record<string, unknown>) {
        setEnviandoNegociacao(true);
        await axios
            .post(route("aplicacao.empresa.pedidos.notificacoes.responder-negociacao", { cnpj, notificacao_id: notificacao.id }), {
                tipo_proposta: tipoProposta,
                negociacao,
            })
            .then((response) => {
                toast.success(response.data.message, { description: response.data.description });
            })
            .catch((error) => toast.error(error.response?.data?.message ?? "Erro ao enviar a resposta da negociação"))
            .finally(() => setEnviandoNegociacao(false));
    }

    return (
        <LayoutAutenticado>
            <div className="mb-4 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Meus pedidos</h1>
                <div className="flex items-center gap-2">
                    <Link href={route("aplicacao.empresa.pedidos.todos-pedidos", { cnpj })}>
                        <Button variant="default">
                            <ListOrdered /> Todos pedidos
                        </Button>
                    </Link>
                    <Button variant="outline" className="relative" onClick={abrirNotificacoes}>
                        <Bell className="text-blue-500" />
                        {notificacoesNaoLidas > 0 && (
                            <Badge className="absolute -right-2 -top-2 h-5 min-w-5 justify-center rounded-full bg-amber-500 px-1 text-xs text-white">
                                {notificacoesNaoLidas}
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs font-bold sm:hidden">
                <div className="rounded bg-orange-600 p-2 text-white">
                    <span className="text-lg">{pedidos.filter((p) => p.status === "pendente").length}</span>
                    <p>Análise</p>
                </div>
                <div className="rounded bg-yellow-600 p-2 text-white">
                    <span className="text-lg">{pedidos.filter((p) => ["sendo preparado", "pedido feito"].includes(p.status)).length}</span>
                    <p>Produção</p>
                </div>
                <div className="rounded bg-green-600 p-2 text-white">
                    <span className="text-lg">{pedidos.filter((p) => p.status === "pronto para entrega").length}</span>
                    <p>Pronto</p>
                </div>
            </div>

            <KanbanBoard
                pedidos={pedidos}
                timezone={timezone}
                configuracoes={configuracoes}
                avancandoId={avancandoId}
                onAbrirDetalhes={abrirDetalhes}
                onAvancar={avancarPedido}
                onMoverStatus={moverStatus}
                onToggleConfig={toggleConfig}
                salvandoConfig={salvandoConfig}
            />

            <PedidoDetalhesDialog
                open={modalDetalheOpen}
                onOpenChange={setModalDetalheOpen}
                pedido={pedidoDetalhe}
                loading={loadingDetalhe}
                timezone={timezone}
                variante="atual"
                onCancelar={() => pedidoDetalhe && abrirCancelamento(pedidoDetalhe)}
                onImprimir={imprimirPedido}
                onVerCliente={() => abrirHistoricoCliente(1)}
                podeVerCliente={Boolean(pedidoDetalhe?.cliente?.id)}
            />

            <PedidoDetalhesDialog
                open={modalPassadoOpen}
                onOpenChange={setModalPassadoOpen}
                pedido={pedidoPassado}
                loading={loadingPassado}
                timezone={timezone}
                variante="passado"
                onImprimir={imprimirPedido}
            />

            <ClienteHistoricoDialog
                open={modalHistoricoOpen}
                onOpenChange={setModalHistoricoOpen}
                historico={historicoCliente}
                loading={loadingHistorico}
                onMudarPagina={abrirHistoricoCliente}
                onVerPedido={abrirPedidoPassado}
            />

            <CancelarPedidoDialog
                open={modalCancelamentoOpen}
                onOpenChange={setModalCancelamentoOpen}
                pedido={pedidoParaCancelar}
                motivos={motivosCancelamento}
                carregandoMotivos={carregandoMotivos}
                loading={loadingCancelamento}
                onSubmit={confirmarCancelamento}
            />

            <ConfirmarEntregaDialog
                open={modalConfirmarEntregaOpen}
                onOpenChange={setModalConfirmarEntregaOpen}
                pedido={pedidoParaConfirmarEntrega}
                loading={loadingConfirmarEntrega}
                onSubmit={confirmarEntregaPedido}
            />

            <NotificacoesDrawer
                open={drawerNotificacoesOpen}
                onOpenChange={setDrawerNotificacoesOpen}
                notificacoes={notificacoes}
                settlements={settlements}
                onVerEvidencias={verEvidencias}
                baixandoEvidenciasId={baixandoEvidenciasId}
                onEnviarNegociacao={enviarNegociacao}
                enviandoNegociacao={enviandoNegociacao}
            />
        </LayoutAutenticado>
    );
}
