import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
    TCashbackConfig,
    TClienteDetalhe,
    TFidelidadeConfig,
} from "@/types/empresa/clientes/types";
import { converteReal } from "@/utils/utils";
import { formatarData, formatarDataHora, formatarTelefone, mascaraCpfCnpj } from "@/utils/pedidos";
import { Flame, Gift, MapPin, User } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    entregue: { label: "Entregue", className: "bg-emerald-600 text-white" },
    "pedido feito": { label: "Pedido feito", className: "bg-sky-500 text-white" },
    cancelado: { label: "Cancelado", className: "bg-destructive text-white" },
};

const RECOMPENSA_LABELS: Record<string, string> = {
    item_gratis: "Item grátis",
    frete_gratis: "Frete grátis",
    desconto_percentual: "Desconto %",
    desconto_fixo: "Desconto fixo",
};

interface IProps {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    detalhe: TClienteDetalhe | undefined;
    loading: boolean;
    fidelidadeConfig?: TFidelidadeConfig;
    cashbackConfig?: TCashbackConfig;
    timezone: string;
}

export default function ClienteDetalhesDialog({
    open,
    onOpenChange,
    detalhe,
    loading,
    fidelidadeConfig,
    cashbackConfig,
    timezone,
}: IProps) {
    const progresso = detalhe?.fidelidade_progresso;

    let labelProgresso = "";
    let percentualProgresso = 0;
    let faltamLabel = "";
    if (fidelidadeConfig && progresso && !progresso.recompensa_disponivel) {
        const meta = fidelidadeConfig.valor_gatilho;
        const atual =
            fidelidadeConfig.tipo_gatilho === "qtd_pedidos"
                ? progresso.contador_atual
                : progresso.valor_acumulado;

        labelProgresso =
            fidelidadeConfig.tipo_gatilho === "qtd_pedidos"
                ? `${atual} de ${meta} pedidos`
                : `R$ ${converteReal(atual)} de R$ ${converteReal(meta)}`;
        percentualProgresso = meta > 0 ? Math.min(100, Math.round((atual / meta) * 100)) : 0;
        const restante = Math.max(0, meta - atual);
        faltamLabel =
            fidelidadeConfig.tipo_gatilho === "qtd_pedidos"
                ? `Faltam ${restante} pedidos para a próxima recompensa`
                : `Faltam R$ ${converteReal(restante)} para a próxima recompensa`;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] w-full max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-3xl lg:max-w-4xl">
                {loading || !detalhe ? (
                    <div className="flex h-60 flex-col items-center justify-center gap-2">
                        <Spinner className="h-8 w-8" />
                        <p className="text-muted-foreground">Carregando cliente...</p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="flex items-start gap-4 pr-6">
                                <div className="rounded-full bg-muted p-3">
                                    <User className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <DialogTitle className="text-xl">{detalhe.cliente.nome}</DialogTitle>
                                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                        {detalhe.cliente.telefone && <span>{formatarTelefone(detalhe.cliente.telefone)}</span>}
                                        {detalhe.cliente.email && <span>{detalhe.cliente.email}</span>}
                                        {detalhe.cliente.cpf_cnpj && <span>{mascaraCpfCnpj(detalhe.cliente.cpf_cnpj)}</span>}
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>

                        {(fidelidadeConfig || cashbackConfig) && (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {fidelidadeConfig && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Fidelidade</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {progresso?.recompensa_disponivel ? (
                                                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3">
                                                    <Gift className="h-6 w-6 text-emerald-600" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-emerald-600">Recompensa disponível!</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(progresso.recompensa_tipo && RECOMPENSA_LABELS[progresso.recompensa_tipo]) ?? progresso.recompensa_tipo}
                                                            {progresso.recompensa_expira_em && ` · Expira ${formatarData(progresso.recompensa_expira_em, timezone)}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : progresso ? (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className={percentualProgresso >= 70 ? "font-semibold text-orange-600" : "text-muted-foreground"}>
                                                            {labelProgresso}
                                                        </span>
                                                        {percentualProgresso >= 70 && <Flame className="h-3 w-3 text-orange-500" />}
                                                    </div>
                                                    <Progress value={percentualProgresso}>
                                                        <ProgressTrack className="h-2">
                                                            <ProgressIndicator className={percentualProgresso >= 70 ? "bg-orange-500" : undefined} />
                                                        </ProgressTrack>
                                                    </Progress>
                                                    <p className="text-xs text-muted-foreground">{faltamLabel}</p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Este cliente ainda não iniciou o programa de fidelidade.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {cashbackConfig && detalhe.resumo_cashback && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Cashback</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Saldo disponível</span>
                                                <span className="font-bold text-emerald-600">R$ {converteReal(detalhe.resumo_cashback.saldo_disponivel)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Total gerado</span>
                                                <span className="text-sm font-medium">R$ {converteReal(detalhe.resumo_cashback.total_gerado)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Total utilizado</span>
                                                <span className="text-sm font-medium">R$ {converteReal(detalhe.resumo_cashback.total_utilizado)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Itens mais pedidos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {detalhe.itens_mais_pedidos.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {detalhe.itens_mais_pedidos.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-4 text-xs font-bold text-muted-foreground">{idx + 1}º</span>
                                                        <span className="max-w-48 truncate text-sm">{item.nome}</span>
                                                    </div>
                                                    <Badge variant="secondary">{item.total_pedido}x</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Nenhum item encontrado.</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Formas de pagamento</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {detalhe.formas_pagamento.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {detalhe.formas_pagamento.map((forma, idx) => (
                                                <div key={idx} className="flex items-center justify-between">
                                                    <span className="text-sm">{forma.forma_pagamento}</span>
                                                    <Badge variant="secondary">{forma.total}x</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Nenhuma forma de pagamento encontrada.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {cashbackConfig && detalhe.historico_cashback.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Histórico de cashback</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col divide-y">
                                        {detalhe.historico_cashback.map((credito, idx) => {
                                            const expirado = new Date(credito.data_vencimento) < new Date();
                                            return (
                                                <div key={idx} className="flex items-center justify-between py-2">
                                                    <div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Pedido #{credito.pedido_id} · {formatarData(credito.data_gerado, timezone)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Vence {formatarData(credito.data_vencimento, timezone)}
                                                            {expirado && <Badge variant="destructive" className="ml-1 h-4">Expirado</Badge>}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-semibold text-emerald-600">+ R$ {converteReal(credito.credito_gerado)}</div>
                                                        {credito.saldo_restante < credito.credito_gerado && (
                                                            <div className="text-xs text-muted-foreground">Saldo: R$ {converteReal(credito.saldo_restante)}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {fidelidadeConfig && detalhe.historico_fidelidade.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Recompensas de fidelidade utilizadas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col divide-y">
                                        {detalhe.historico_fidelidade.map((pedido) => (
                                            <div key={pedido.id} className="flex items-center justify-between py-2">
                                                <div>
                                                    <div className="text-sm font-medium">#{pedido.id} · {formatarData(pedido.created_at, timezone)}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {pedido.fidelidade_desconto > 0 ? "Desconto aplicado" : "Recompensa aplicada"}
                                                    </div>
                                                </div>
                                                {pedido.fidelidade_desconto > 0 ? (
                                                    <Badge className="bg-emerald-600 text-white">- R$ {converteReal(pedido.fidelidade_desconto)}</Badge>
                                                ) : (
                                                    <Badge className="bg-purple-600 text-white">Recompensa</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {detalhe.cliente.enderecos.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Endereços de entrega</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-2">
                                        {detalhe.cliente.enderecos.map((endereco) => (
                                            <div key={endereco.id} className="flex items-start gap-2 text-sm">
                                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                                <span>
                                                    {endereco.logradouro}, {endereco.numero}
                                                    {endereco.complemento && ` — ${endereco.complemento}`} · {endereco.bairro} · {endereco.cidade}/{endereco.uf} · CEP {endereco.cep}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Últimos 10 pedidos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {detalhe.historico_pedidos.length > 0 ? (
                                    <div className="flex flex-col divide-y">
                                        {detalhe.historico_pedidos.map((pedido) => {
                                            const status = STATUS_LABELS[pedido.status] ?? { label: pedido.status, className: "" };
                                            return (
                                                <div key={pedido.id} className="flex items-center justify-between py-2">
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <div className="text-sm font-medium">#{pedido.id}</div>
                                                            <div className="text-xs text-muted-foreground">{formatarDataHora(pedido.created_at, timezone)}</div>
                                                        </div>
                                                        <Badge className={status.className}>{status.label}</Badge>
                                                        {pedido.fidelidade_recompensa_aplicada && (
                                                            <Badge className="bg-purple-600 text-white">
                                                                <Gift className="h-3 w-3" /> Recompensa
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-semibold text-emerald-600">R$ {converteReal(pedido.total)}</div>
                                                        {pedido.forma_pagamento_label && (
                                                            <div className="text-xs text-muted-foreground">{pedido.forma_pagamento_label}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Nenhum pedido encontrado.</p>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
