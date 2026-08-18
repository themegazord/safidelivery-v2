import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { INotificacao } from "@/types/empresa/pedidos/types";
import { converteReal } from "@/utils/utils";
import {
    ACAO_NEGOCIACAO_LABEL,
    RAZAO_NEGOCIACAO_LABEL,
    STATUS_SETTLEMENT_LABEL,
    TIPO_NEGOCIACAO_LABEL,
} from "@/utils/negociacaoIfood";
import { BellOff, ClipboardCheck, Download } from "lucide-react";

type TNegociacao = {
    decisao?: "aceitar" | "recusar" | "proposta";
    motivo?: string;
    razao?: string;
    minutos_adicionais?: number;
    valor_contraproposta?: number;
};

interface IProps {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    notificacoes: INotificacao[];
    settlements: Record<string, string | null>;
    onVerEvidencias: (notificacaoId: number) => void;
    baixandoEvidenciasId: number | null;
    onEnviarNegociacao: (notificacao: INotificacao, tipoProposta: string, negociacao: TNegociacao) => Promise<void>;
    enviandoNegociacao: boolean;
}

function Countdown({ startedAt, target }: { startedAt: string; target: string }) {
    const [agora, setAgora] = useState(() => Date.now());

    useEffect(() => {
        const intervalo = setInterval(() => setAgora(Date.now()), 1000);
        return () => clearInterval(intervalo);
    }, []);

    const inicio = new Date(startedAt).getTime();
    const alvo = new Date(target).getTime();
    const total = Math.max(1, alvo - inicio);
    const restante = Math.max(0, alvo - agora);
    const expirado = restante === 0;

    function formatar(ms: number) {
        const s = Math.floor(ms / 1000);
        const h = String(Math.floor(s / 3600)).padStart(2, "0");
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
        const sec = String(s % 60).padStart(2, "0");
        return `${h}:${m}:${sec}`;
    }

    return (
        <div className="space-y-1">
            <div className="text-sm font-semibold text-destructive">
                {expirado ? "Expirado" : <>Expira em: {formatar(restante)}</>}
            </div>
            {!expirado && <Progress value={Math.round((restante / total) * 100)} />}
        </div>
    );
}

function FormularioDelay({
    notificacao,
    negociacao,
    setNegociacao,
    defineMotivoNaoEntregar,
    setDefineMotivoNaoEntregar,
    enviando,
    onEnviar,
}: {
    notificacao: INotificacao;
    negociacao: TNegociacao;
    setNegociacao: (n: TNegociacao) => void;
    defineMotivoNaoEntregar: boolean;
    setDefineMotivoNaoEntregar: (v: boolean) => void;
    enviando: boolean;
    onEnviar: (decisao: "proposta" | "aceitar") => void;
}) {
    const alternativa = notificacao.data?.metadata?.alternatives?.[0];
    const minutosValidos: number[] = alternativa?.metadata?.allowedsAdditionalTimeInMinutes ?? [];
    const opcoesAtraso: string[] = alternativa?.metadata?.allowedsAdditionalTimeReasons ?? [];
    const opcoesCancelamento: string[] = notificacao.data?.metadata?.metadata?.acceptCancellationReasons ?? [];

    if (!defineMotivoNaoEntregar) {
        return (
            <div className="space-y-4 py-4">
                <Field>
                    <FieldLabel>Quanto tempo a mais você precisa para entregar o pedido?</FieldLabel>
                    <Select
                        items={Object.fromEntries(minutosValidos.map((m) => [String(m), `${m} minutos.`]))}
                        value={negociacao.minutos_adicionais ? String(negociacao.minutos_adicionais) : ""}
                        onValueChange={(v) => setNegociacao({ ...negociacao, minutos_adicionais: Number(v) })}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Informe quantos minutos você precisa..." />
                        </SelectTrigger>
                        <SelectContent>
                            {minutosValidos.map((m) => (
                                <SelectItem key={m} value={String(m)}>{m} minutos.</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <FieldLabel>Selecione o motivo do atraso</FieldLabel>
                    <Select
                        items={Object.fromEntries(opcoesAtraso.map((o) => [o, RAZAO_NEGOCIACAO_LABEL[o] ?? o]))}
                        value={negociacao.motivo ?? ""}
                        onValueChange={(v) => setNegociacao({ ...negociacao, motivo: v as string })}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um desses motivos do atraso..." />
                        </SelectTrigger>
                        <SelectContent>
                            {opcoesAtraso.map((o) => (
                                <SelectItem key={o} value={o}>{RAZAO_NEGOCIACAO_LABEL[o] ?? o}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <div className="flex flex-col gap-2">
                    <Button disabled={enviando} onClick={() => onEnviar("proposta")} className="bg-emerald-600 hover:bg-emerald-700">
                        {enviando ? <Spinner /> : "Atualizar previsão de entrega"}
                    </Button>
                    <Button type="button" variant="outline" className="text-destructive" onClick={() => setDefineMotivoNaoEntregar(true)}>
                        Pedido não será mais entregue
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 py-4">
            <Field>
                <FieldLabel>Selecione o motivo do atraso</FieldLabel>
                <Select
                    items={Object.fromEntries(opcoesCancelamento.map((o) => [o, RAZAO_NEGOCIACAO_LABEL[o] ?? o]))}
                    value={negociacao.motivo ?? ""}
                    onValueChange={(v) => setNegociacao({ ...negociacao, motivo: v as string })}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um desses motivos do atraso..." />
                    </SelectTrigger>
                    <SelectContent>
                        {opcoesCancelamento.map((o) => (
                            <SelectItem key={o} value={o}>{RAZAO_NEGOCIACAO_LABEL[o] ?? o}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>
            <Field>
                <FieldLabel>Detalhe mais o motivo:</FieldLabel>
                <Textarea
                    rows={3}
                    value={negociacao.razao ?? ""}
                    onChange={(e) => setNegociacao({ ...negociacao, razao: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                    Cancelar muitos pedidos pode afetar o desempenho da sua loja no iFood.
                </p>
            </Field>
            <div className="flex flex-col gap-2">
                <Button disabled={enviando} onClick={() => onEnviar("aceitar")} className="bg-emerald-600 hover:bg-emerald-700">
                    {enviando ? <Spinner /> : "Enviar"}
                </Button>
                <Button type="button" variant="outline" className="text-destructive" onClick={() => setDefineMotivoNaoEntregar(false)}>
                    Voltar
                </Button>
            </div>
        </div>
    );
}

function FormularioReembolso({
    notificacao,
    tipoProposta,
    negociacao,
    setNegociacao,
    enviando,
    onEnviar,
}: {
    notificacao: INotificacao;
    tipoProposta: string;
    negociacao: TNegociacao;
    setNegociacao: (n: TNegociacao) => void;
    enviando: boolean;
    onEnviar: () => void;
}) {
    const acaoNegociacao = notificacao.data?.metadata?.action;
    const alternativa = notificacao.data?.metadata?.alternatives?.[0];
    const valorMaximo = alternativa ? (alternativa.maxAmount?.value ?? 0) / 100 : 0;
    const itens: any[] = notificacao.data?.metadata?.metadata?.items ?? [];

    let valorTotalItensProposta = 0;
    if (tipoProposta === "AFTER_DELIVERY_PARTIALLY") {
        valorTotalItensProposta = itens.reduce((acc, item) => acc + (item.quantity * item.amount.value) / 100, 0);
    }
    const valorReembolso = acaoNegociacao === "CANCELLATION" ? valorMaximo : valorTotalItensProposta;

    return (
        <div className="space-y-4 py-4">
            {tipoProposta === "AFTER_DELIVERY_PARTIALLY" && itens.length > 0 && (
                <div className="space-y-2">
                    <p className="text-muted-foreground">Itens que não foram entregues</p>
                    {itens.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-2 border-b pb-2 text-sm">
                            <p className="col-span-1">{item.quantity}x</p>
                            <p className="col-span-3">Item #{item.index}</p>
                            <p className="col-span-1">{converteReal((item.quantity * item.amount.value) / 100)}</p>
                        </div>
                    ))}
                </div>
            )}

            <label className="flex cursor-pointer gap-3 rounded-lg border p-4 hover:border-foreground/30">
                <input
                    type="radio"
                    name={`decisao-${notificacao.id}`}
                    checked={negociacao.decisao === "aceitar"}
                    onChange={() => setNegociacao({ ...negociacao, decisao: "aceitar" })}
                    className="mt-1 h-4 w-4"
                />
                <div>
                    <p className="font-medium">Aceitar reembolso de {converteReal(valorReembolso)}</p>
                    <p className="text-sm text-muted-foreground">Cliente receberá o valor total desse pedido</p>
                </div>
            </label>

            <div className="rounded-lg border p-4">
                <label className="flex cursor-pointer flex-col gap-3">
                    <span className="flex gap-3">
                        <input
                            type="radio"
                            name={`decisao-${notificacao.id}`}
                            checked={negociacao.decisao === "proposta"}
                            onChange={() => setNegociacao({ ...negociacao, decisao: "proposta" })}
                            className="mt-1 h-4 w-4"
                        />
                        <span>
                            <p className="font-medium">Enviar proposta de reembolso</p>
                            <p className="text-sm text-muted-foreground">Cliente pode aceitar ou recusar o valor</p>
                        </span>
                    </span>
                    {negociacao.decisao === "proposta" && (
                        <Field>
                            <FieldLabel>Qual o valor que gostaria de reembolsar o cliente?</FieldLabel>
                            <Input
                                type="number"
                                step="0.01"
                                value={negociacao.valor_contraproposta ?? ""}
                                onChange={(e) => setNegociacao({ ...negociacao, valor_contraproposta: Number(e.target.value) })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Você pode oferecer um valor menor ou até {converteReal(valorMaximo)} de reembolso.
                            </p>
                        </Field>
                    )}
                </label>
            </div>

            <div className="rounded-lg border p-4">
                <label className="flex cursor-pointer flex-col gap-3">
                    <span className="flex gap-3">
                        <input
                            type="radio"
                            name={`decisao-${notificacao.id}`}
                            checked={negociacao.decisao === "recusar"}
                            onChange={() => setNegociacao({ ...negociacao, decisao: "recusar" })}
                            className="mt-1 h-4 w-4"
                        />
                        <span>
                            <p className="font-medium">Recusar reembolso de {converteReal(valorReembolso)}</p>
                            <p className="text-sm text-muted-foreground">Cliente ainda pode solicitar uma análise do iFood</p>
                        </span>
                    </span>
                    {negociacao.decisao === "recusar" && (
                        <Field>
                            <FieldLabel>Conte para o Cliente por qual motivo você vai recusar:</FieldLabel>
                            <Textarea
                                value={negociacao.razao ?? ""}
                                onChange={(e) => setNegociacao({ ...negociacao, razao: e.target.value })}
                            />
                        </Field>
                    )}
                </label>
            </div>

            <Button className="w-full" disabled={enviando} onClick={onEnviar}>
                {enviando ? <Spinner /> : "Continuar"}
            </Button>
        </div>
    );
}

function FormularioCancelamentoSimples({
    notificacao,
    negociacao,
    setNegociacao,
    enviando,
    onEnviar,
}: {
    notificacao: INotificacao;
    negociacao: TNegociacao;
    setNegociacao: (n: TNegociacao) => void;
    enviando: boolean;
    onEnviar: () => void;
}) {
    return (
        <div className="space-y-4 py-4">
            <label className="flex cursor-pointer gap-3 rounded-lg border p-4 hover:border-foreground/30">
                <input
                    type="radio"
                    name={`decisao-${notificacao.id}`}
                    checked={negociacao.decisao === "aceitar"}
                    onChange={() => setNegociacao({ ...negociacao, decisao: "aceitar" })}
                    className="mt-1 h-4 w-4"
                />
                <p className="font-medium">Aceitar cancelamento</p>
            </label>
            <div className="rounded-lg border p-4">
                <label className="flex cursor-pointer flex-col gap-3">
                    <span className="flex gap-3">
                        <input
                            type="radio"
                            name={`decisao-${notificacao.id}`}
                            checked={negociacao.decisao === "recusar"}
                            onChange={() => setNegociacao({ ...negociacao, decisao: "recusar" })}
                            className="mt-1 h-4 w-4"
                        />
                        <p className="font-medium">Recusar cancelamento</p>
                    </span>
                    {negociacao.decisao === "recusar" && (
                        <Field>
                            <FieldLabel>Conte para o Cliente por qual motivo você vai recusar:</FieldLabel>
                            <Textarea
                                value={negociacao.razao ?? ""}
                                onChange={(e) => setNegociacao({ ...negociacao, razao: e.target.value })}
                            />
                        </Field>
                    )}
                </label>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={enviando} onClick={onEnviar}>
                {enviando ? <Spinner /> : "Concluir"}
            </Button>
        </div>
    );
}

export default function NotificacoesDrawer({
    open,
    onOpenChange,
    notificacoes,
    settlements,
    onVerEvidencias,
    baixandoEvidenciasId,
    onEnviarNegociacao,
    enviandoNegociacao,
}: IProps) {
    const [decidindoId, setDecidindoId] = useState<number | null>(null);
    const [negociacao, setNegociacao] = useState<TNegociacao>({});
    const [defineMotivoNaoEntregar, setDefineMotivoNaoEntregar] = useState(false);

    function abreDecisao(notificacaoId: number | null) {
        setDecidindoId(notificacaoId);
        setNegociacao({});
        setDefineMotivoNaoEntregar(false);
    }

    async function enviar(notificacao: INotificacao, tipoProposta: string, decisaoOverride?: TNegociacao["decisao"]) {
        await onEnviarNegociacao(notificacao, tipoProposta, decisaoOverride ? { ...negociacao, decisao: decisaoOverride } : negociacao);
        abreDecisao(null);
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
            <DrawerContent className="w-full p-6 lg:w-[32vw]">
                <DrawerHeader>
                    <DrawerTitle>Notificações</DrawerTitle>
                </DrawerHeader>
                <div className="scroll-fade flex-1 space-y-3 overflow-y-auto p-2">
                    {notificacoes.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <BellOff className="mb-4 h-16 w-16 text-muted-foreground/40" />
                            <p className="text-lg text-muted-foreground">Sem notificações no momento</p>
                        </div>
                    )}
                    {notificacoes.map((notificacao) => {
                        const ehPedidoIfood = Boolean(notificacao.data?.pedido_ifood_id);
                        const ehHsd = notificacao.data?.code === "HSD";
                        const target = notificacao.data?.metadata?.expiresAt;
                        const disputeId = notificacao.data?.metadata?.disputeId;
                        const acaoNegociacao = notificacao.data?.metadata?.action;
                        const tipoProposta = notificacao.data?.metadata?.handshakeType;
                        const settlementStatus = ehHsd ? settlements[notificacao.data?.pedido_ifood_id] : null;
                        const evidencias = notificacao.data?.metadata?.metadata?.evidences;

                        if (!ehPedidoIfood) {
                            return (
                                <Card key={notificacao.id} className="border-emerald-200">
                                    <CardHeader>
                                        <CardTitle className="text-base">{notificacao.titulo}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-600">
                                            <ClipboardCheck className="h-4 w-4" /> Pedido Local
                                        </div>
                                        <p className="text-sm text-muted-foreground">{notificacao.mensagem}</p>
                                    </CardContent>
                                </Card>
                            );
                        }

                        return (
                            <Card key={notificacao.id}>
                                <CardHeader>
                                    <CardTitle className="text-base">{notificacao.titulo}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p>{notificacao.mensagem}</p>
                                    {ehHsd && target && (
                                        <div className="space-y-2">
                                            {settlementStatus ? (
                                                <p className={`py-2 text-center font-bold ${STATUS_SETTLEMENT_LABEL[settlementStatus]?.className ?? ""}`}>
                                                    {STATUS_SETTLEMENT_LABEL[settlementStatus]?.label ?? settlementStatus}
                                                </p>
                                            ) : (
                                                <Countdown startedAt={notificacao.created_at} target={target} />
                                            )}
                                            <div className="flex flex-wrap gap-2 text-sm">
                                                <p className="font-bold">Ação da Negociação:</p>
                                                <p>{ACAO_NEGOCIACAO_LABEL[acaoNegociacao] ?? acaoNegociacao}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-sm">
                                                <p className="font-bold">Tipo da Negociação:</p>
                                                <p>{TIPO_NEGOCIACAO_LABEL[tipoProposta] ?? tipoProposta}</p>
                                            </div>

                                            {decidindoId === notificacao.id ? (
                                                <>
                                                    {!settlementStatus && (
                                                        <>
                                                            <h4 className="font-bold">Informe o que será feito</h4>
                                                            {tipoProposta === "DELAY" && (
                                                                <FormularioDelay
                                                                    notificacao={notificacao}
                                                                    negociacao={negociacao}
                                                                    setNegociacao={setNegociacao}
                                                                    defineMotivoNaoEntregar={defineMotivoNaoEntregar}
                                                                    setDefineMotivoNaoEntregar={setDefineMotivoNaoEntregar}
                                                                    enviando={enviandoNegociacao}
                                                                    onEnviar={(decisao) => enviar(notificacao, tipoProposta, decisao)}
                                                                />
                                                            )}
                                                            {(tipoProposta === "AFTER_DELIVERY" || tipoProposta === "AFTER_DELIVERY_PARTIALLY") && (
                                                                <FormularioReembolso
                                                                    notificacao={notificacao}
                                                                    tipoProposta={tipoProposta}
                                                                    negociacao={negociacao}
                                                                    setNegociacao={setNegociacao}
                                                                    enviando={enviandoNegociacao}
                                                                    onEnviar={() => enviar(notificacao, tipoProposta)}
                                                                />
                                                            )}
                                                            {tipoProposta !== "DELAY" && tipoProposta !== "AFTER_DELIVERY" && tipoProposta !== "AFTER_DELIVERY_PARTIALLY" && (
                                                                <FormularioCancelamentoSimples
                                                                    notificacao={notificacao}
                                                                    negociacao={negociacao}
                                                                    setNegociacao={setNegociacao}
                                                                    enviando={enviandoNegociacao}
                                                                    onEnviar={() => enviar(notificacao, tipoProposta)}
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                    <div className="flex flex-col gap-2">
                                                        {evidencias && (
                                                            <Button
                                                                variant="outline"
                                                                className="w-full"
                                                                disabled={baixandoEvidenciasId === notificacao.id}
                                                                onClick={() => onVerEvidencias(notificacao.id)}
                                                            >
                                                                {baixandoEvidenciasId === notificacao.id ? <Spinner /> : <Download />} Baixar evidência
                                                            </Button>
                                                        )}
                                                        <Button variant="outline" className="w-full" onClick={() => abreDecisao(null)}>
                                                            Cancelar
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                !settlementStatus && disputeId && (
                                                    <Button variant="outline" className="w-full" onClick={() => abreDecisao(notificacao.id)}>
                                                        Decidir proposta
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
