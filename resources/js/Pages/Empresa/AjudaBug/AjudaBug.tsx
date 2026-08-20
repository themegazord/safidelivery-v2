import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import Stats from "@/components/utils/Stats";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import { TGrupoStatus, TGruposIssues, TIssue, TLabel, TStatsBug } from "@/types/empresa/ajudabug/types";
import {
    AlertTriangle,
    Bug,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    ListChecks,
    MessageCircle,
    RefreshCw,
    Send,
    Settings,
    Tag,
    TrendingUp,
} from "lucide-react";

interface IProps {
    grupos: TGruposIssues;
    stats: TStatsBug;
    labelsDisponiveis: TLabel[];
    erroGithub: boolean;
}

const FORMULARIO_PADRAO = {
    titulo: "",
    descricao: "",
    passos: "",
    labels: [] as string[],
};

const CONFIG_GRUPOS: Record<TGrupoStatus, { titulo: string; icon: React.ReactNode; color: "yellow" | "blue" | "green" | "gray" }> = {
    aguardando: { titulo: "⏳ Aguardando", icon: <Clock className="h-4 w-4" />, color: "yellow" },
    em_desenvolvimento: { titulo: "🚧 Em desenvolvimento", icon: <Settings className="h-4 w-4" />, color: "blue" },
    finalizado: { titulo: "✅ Finalizado", icon: <CheckCircle2 className="h-4 w-4" />, color: "green" },
    outros: { titulo: "📋 Outros", icon: <FileText className="h-4 w-4" />, color: "gray" },
};

export default function AjudaBug({ grupos, stats, labelsDisponiveis, erroGithub }: IProps) {
    const { cnpj } = usePage<{ cnpj: string }>().props;

    const [formulario, setFormulario] = useState(FORMULARIO_PADRAO);
    const [enviando, setEnviando] = useState(false);
    const [recarregando, setRecarregando] = useState(false);

    function alternarLabel(nome: string) {
        setFormulario((atual) => ({
            ...atual,
            labels: atual.labels.includes(nome)
                ? atual.labels.filter((l) => l !== nome)
                : [...atual.labels, nome],
        }));
    }

    function recarregar() {
        setRecarregando(true);
        router.reload({
            only: ["grupos", "stats", "labelsDisponiveis", "erroGithub"],
            onFinish: () => setRecarregando(false),
        });
    }

    async function enviar() {
        if (!formulario.titulo || !formulario.descricao) {
            toast.warning("Preencha o título e a descrição do problema.");
            return;
        }

        setEnviando(true);
        await axios
            .post(route("aplicacao.empresa.ajuda.bug.store", { cnpj }), formulario)
            .then((response) => {
                toast.success(response.data.mensagem);
                setFormulario(FORMULARIO_PADRAO);
                recarregar();
            })
            .catch((error) =>
                toast.error(error.response?.data?.message ?? "Não foi possível reportar o problema"),
            )
            .finally(() => setEnviando(false));
    }

    return (
        <LayoutAutenticado>
            <div className="space-y-6">
                <header className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Encontrou um problema?</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Descreva o que aconteceu e acompanhe o andamento dos seus chamados.
                        </p>
                    </div>
                    <Button type="button" variant="outline" onClick={recarregar} disabled={recarregando}>
                        {recarregando ? <Spinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                        Atualizar
                    </Button>
                </header>

                {erroGithub && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Não foi possível carregar os chamados</AlertTitle>
                        <AlertDescription>
                            Tivemos um problema ao consultar o GitHub agora. Tente atualizar a página em instantes.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <Stats title="Total" value={stats.total} icon={<FileText className="h-5 w-5" />} color="gray" />
                    <Stats title="Abertas" value={stats.abertas} icon={<TrendingUp className="h-5 w-5" />} color="green" />
                    <Stats title="Em desenvolvimento" value={stats.em_desenvolvimento} icon={<Settings className="h-5 w-5" />} color="blue" />
                    <Stats title="Aguardando" value={stats.aguardando} icon={<Clock className="h-5 w-5" />} color="yellow" />
                    <Stats title="Finalizado" value={stats.finalizado} icon={<CheckCircle2 className="h-5 w-5" />} color="purple" />
                    <Stats title="Sem label" value={stats.sem_label} icon={<Tag className="h-5 w-5" />} color="red" />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Relatar um problema</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Field>
                            <FieldLabel htmlFor="bug-titulo">Título</FieldLabel>
                            <Input
                                id="bug-titulo"
                                placeholder="Resuma o problema em poucas palavras"
                                value={formulario.titulo}
                                onChange={(e) =>
                                    setFormulario((atual) => ({ ...atual, titulo: e.target.value }))
                                }
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="bug-descricao">Descrição</FieldLabel>
                            <Textarea
                                id="bug-descricao"
                                className="h-28 resize-none field-sizing-fixed"
                                placeholder="O que aconteceu? O que você esperava que acontecesse?"
                                value={formulario.descricao}
                                onChange={(e) =>
                                    setFormulario((atual) => ({ ...atual, descricao: e.target.value }))
                                }
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="bug-passos">Passos para reproduzir</FieldLabel>
                            <Textarea
                                id="bug-passos"
                                className="h-20 resize-none field-sizing-fixed"
                                placeholder="Opcional: como podemos reproduzir o problema?"
                                value={formulario.passos}
                                onChange={(e) =>
                                    setFormulario((atual) => ({ ...atual, passos: e.target.value }))
                                }
                            />
                        </Field>

                        {labelsDisponiveis.length > 0 && (
                            <Field>
                                <FieldLabel>Categorias</FieldLabel>
                                <div className="flex flex-wrap gap-2">
                                    {labelsDisponiveis.map((label) => {
                                        const selecionada = formulario.labels.includes(label.name);
                                        return (
                                            <button
                                                key={label.name}
                                                type="button"
                                                onClick={() => alternarLabel(label.name)}
                                                className="cursor-pointer"
                                            >
                                                <Badge
                                                    variant={selecionada ? "default" : "outline"}
                                                    style={
                                                        selecionada
                                                            ? { backgroundColor: `#${label.color}`, color: "#fff" }
                                                            : undefined
                                                    }
                                                >
                                                    {label.name}
                                                </Badge>
                                            </button>
                                        );
                                    })}
                                </div>
                                <FieldDescription>Selecione o que melhor descreve o problema.</FieldDescription>
                            </Field>
                        )}

                        <div className="flex justify-end">
                            <Button onClick={enviar} disabled={enviando}>
                                {enviando ? (
                                    <>
                                        <Spinner /> Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send /> Enviar
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {(Object.keys(CONFIG_GRUPOS) as TGrupoStatus[]).map((chave) => {
                    const issues = grupos[chave] ?? [];
                    if (issues.length === 0) return null;

                    const config = CONFIG_GRUPOS[chave];

                    return (
                        <Card key={chave}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    {config.icon}
                                    {config.titulo}
                                </CardTitle>
                                <Badge variant="outline">{issues.length}</Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col divide-y">
                                    {issues.map((issue) => (
                                        <IssueRow key={issue.id} issue={issue} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {stats.total === 0 && !erroGithub && (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-2 py-6 text-muted-foreground/60">
                            <Bug className="h-8 w-8" />
                            <p className="text-sm">Nenhum problema reportado ainda</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </LayoutAutenticado>
    );
}

function IssueRow({ issue }: { issue: TIssue }) {
    return (
        <a
            href={issue.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-2 py-3 hover:bg-muted/40"
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <Badge variant="outline">#{issue.numero}</Badge>
                    <p className="truncate font-semibold">{issue.titulo}</p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>

            {issue.labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {issue.labels.map((label) => (
                        <Badge
                            key={label.name}
                            style={{ backgroundColor: `#${label.color}`, color: "#fff" }}
                        >
                            {label.name}
                        </Badge>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span>{issue.estado === "open" ? "🟢 Aberto" : "🔴 Fechado"}</span>
                <span>{new Date(issue.criado_em).toLocaleDateString("pt-BR")}</span>
                {issue.comentarios > 0 && (
                    <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" /> {issue.comentarios}
                    </span>
                )}
                {issue.estado_motivo === "completed" && (
                    <span className="flex items-center gap-1 text-green-600">
                        <ListChecks className="h-3.5 w-3.5" /> Concluído com sucesso
                    </span>
                )}
            </div>
        </a>
    );
}
