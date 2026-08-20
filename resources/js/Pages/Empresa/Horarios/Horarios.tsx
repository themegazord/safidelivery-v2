import { useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import { DIAS_SEMANA } from "@/components/Empresa/Itens/UpsertItemDrawer";
import {
    TFuncionamentoEstabelecimento,
    TFusoHorario,
    THorarioFuncionamento,
    THorariosPorTipo,
    TIndisponibilidade,
    TTipoFuncionamento,
} from "@/types/empresa/horarios/types";
import { CalendarOff, Clock, Plus, Trash2 } from "lucide-react";

interface IProps {
    horariosPorTipo: THorariosPorTipo;
    indisponibilidades: TIndisponibilidade[];
    funcionamentoEstabelecimento: TFuncionamentoEstabelecimento;
    fusosHorarios: TFusoHorario[];
    fusoHorario: number | null;
}

const TIPOS_FUNCIONAMENTO: { value: TTipoFuncionamento; label: string }[] = [
    { value: "delivery", label: "Delivery" },
    { value: "retirada", label: "Retirada" },
    { value: "mesa", label: "Mesa" },
];

const NOVA_INDISPONIBILIDADE = {
    titulo: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
};

export default function Horarios({
    horariosPorTipo,
    indisponibilidades,
    funcionamentoEstabelecimento,
    fusosHorarios,
    fusoHorario,
}: IProps) {
    const { cnpj } = usePage<{ cnpj: string }>().props;

    const [funcionamento, setFuncionamento] = useState<TFuncionamentoEstabelecimento>(
        funcionamentoEstabelecimento,
    );
    const [fuso, setFuso] = useState<number | null>(fusoHorario);
    const [salvandoFuncionamento, setSalvandoFuncionamento] = useState(false);

    const [grade, setGrade] = useState<THorariosPorTipo>(horariosPorTipo);
    const [salvandoGrade, setSalvandoGrade] = useState<TTipoFuncionamento | null>(null);

    const [listaIndisponibilidades, setListaIndisponibilidades] =
        useState<TIndisponibilidade[]>(indisponibilidades);
    const [novaIndisponibilidade, setNovaIndisponibilidade] = useState(NOVA_INDISPONIBILIDADE);
    const [salvandoIndisponibilidade, setSalvandoIndisponibilidade] = useState(false);
    const [removendoIndisponibilidade, setRemovendoIndisponibilidade] = useState<number | null>(
        null,
    );

    async function salvarFuncionamento() {
        if (!fuso) {
            toast.warning("Selecione o fuso horário da loja.");
            return;
        }

        setSalvandoFuncionamento(true);
        await axios
            .post(route("aplicacao.empresa.horarios.funcionamento", { cnpj }), {
                funcionamentoEstabelecimento: funcionamento,
                fuso_horario: fuso,
            })
            .then((response) => toast.success(response.data.mensagem))
            .catch((error) =>
                toast.error(error.response?.data?.message ?? "Não foi possível salvar a configuração"),
            )
            .finally(() => setSalvandoFuncionamento(false));
    }

    function adicionaHorario(tipo: TTipoFuncionamento, dia_semana: THorarioFuncionamento["dia_semana"]) {
        setGrade((atual) => ({
            ...atual,
            [tipo]: [
                ...atual[tipo],
                { dia_semana, hora_inicio: "08:00", hora_fim: "18:00", status: true },
            ],
        }));
    }

    function atualizaHorario(
        tipo: TTipoFuncionamento,
        index: number,
        campo: keyof THorarioFuncionamento,
        valor: string | boolean,
    ) {
        setGrade((atual) => ({
            ...atual,
            [tipo]: atual[tipo].map((horario, i) =>
                i === index ? { ...horario, [campo]: valor } : horario,
            ),
        }));
    }

    function removeHorario(tipo: TTipoFuncionamento, index: number) {
        setGrade((atual) => ({
            ...atual,
            [tipo]: atual[tipo].filter((_, i) => i !== index),
        }));
    }

    async function salvarGrade(tipo: TTipoFuncionamento) {
        setSalvandoGrade(tipo);
        await axios
            .post(route("aplicacao.empresa.horarios.grade", { cnpj, tipo_funcionamento: tipo }), {
                horarios: grade[tipo],
            })
            .then((response) => toast.success(response.data.mensagem))
            .catch((error) =>
                toast.error(error.response?.data?.message ?? "Não foi possível salvar a grade de horários"),
            )
            .finally(() => setSalvandoGrade(null));
    }

    async function cadastrarIndisponibilidade() {
        setSalvandoIndisponibilidade(true);
        await axios
            .post(route("aplicacao.empresa.horarios.indisponibilidades.store", { cnpj }), novaIndisponibilidade)
            .then((response) => {
                toast.success(response.data.mensagem);
                setNovaIndisponibilidade(NOVA_INDISPONIBILIDADE);
                setListaIndisponibilidades((atual) => [...atual, response.data.indisponibilidade]);
            })
            .catch((error) =>
                toast.error(error.response?.data?.message ?? "Não foi possível cadastrar o bloqueio"),
            )
            .finally(() => setSalvandoIndisponibilidade(false));
    }

    async function removerIndisponibilidade(id: number) {
        setRemovendoIndisponibilidade(id);
        await axios
            .delete(
                route("aplicacao.empresa.horarios.indisponibilidades.destroy", {
                    cnpj,
                    indisponibilidade_id: id,
                }),
            )
            .then((response) => {
                toast.success(response.data.mensagem);
                setListaIndisponibilidades((atual) => atual.filter((item) => item.id !== id));
            })
            .catch((error) =>
                toast.error(error.response?.data?.message ?? "Não foi possível remover o bloqueio"),
            )
            .finally(() => setRemovendoIndisponibilidade(null));
    }

    return (
        <LayoutAutenticado>
            <div className="space-y-6">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight">Horários de funcionamento</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Defina quando sua loja recebe pedidos por delivery, retirada e mesa.
                    </p>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Funcionamento do estabelecimento</CardTitle>
                        <CardDescription>
                            Controla se a loja aceita pedidos independente da grade abaixo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Field>
                            <FieldLabel htmlFor="fuso-horario">Fuso horário</FieldLabel>
                            <Select
                                name="fuso-horario"
                                value={fuso ? String(fuso) : undefined}
                                onValueChange={(value) => setFuso(value ? Number(value) : null)}
                            >
                                <SelectTrigger id="fuso-horario" className="w-full">
                                    <SelectValue placeholder="Selecione...">
                                        {(value: string | null) =>
                                            fusosHorarios.find((fusoDisponivel) => String(fusoDisponivel.id) === value)
                                                ?.name ?? "Selecione..."
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {fusosHorarios.map((fusoDisponivel) => (
                                        <SelectItem key={fusoDisponivel.id} value={String(fusoDisponivel.id)}>
                                            {fusoDisponivel.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldDescription>
                                Usado para calcular corretamente os horários de funcionamento e bloqueios.
                            </FieldDescription>
                        </Field>

                        <RadioGroup
                            value={funcionamento}
                            onValueChange={(value) =>
                                setFuncionamento(value as TFuncionamentoEstabelecimento)
                            }
                            className="grid gap-3 sm:grid-cols-3"
                        >
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                <RadioGroupItem value="horarios" />
                                <div>
                                    <p className="text-sm font-medium">Seguir horários</p>
                                    <p className="text-xs text-muted-foreground">Usa a grade configurada abaixo</p>
                                </div>
                            </label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                <RadioGroupItem value="sempre" />
                                <div>
                                    <p className="text-sm font-medium">Sempre aberto</p>
                                    <p className="text-xs text-muted-foreground">Ignora a grade e aceita pedidos</p>
                                </div>
                            </label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                <RadioGroupItem value="fechado" />
                                <div>
                                    <p className="text-sm font-medium">Fechado</p>
                                    <p className="text-xs text-muted-foreground">Não recebe pedidos agora</p>
                                </div>
                            </label>
                        </RadioGroup>

                        <div className="flex justify-end">
                            <Button onClick={salvarFuncionamento} disabled={salvandoFuncionamento}>
                                {salvandoFuncionamento ? (
                                    <>
                                        <Spinner /> Salvando...
                                    </>
                                ) : (
                                    "Salvar"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Grade de horários</CardTitle>
                        <CardDescription>
                            Cada tipo de atendimento pode ter uma grade diferente. Um dia pode ter mais de um período (ex: almoço e jantar).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="delivery">
                            <TabsList>
                                {TIPOS_FUNCIONAMENTO.map((tipo) => (
                                    <TabsTrigger key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {TIPOS_FUNCIONAMENTO.map((tipo) => (
                                <TabsContent key={tipo.value} value={tipo.value} className="space-y-4 pt-4">
                                    {DIAS_SEMANA.map((dia) => {
                                        const horariosDoDia = grade[tipo.value]
                                            .map((horario, index) => ({ horario, index }))
                                            .filter(({ horario }) => horario.dia_semana === dia.value);

                                        return (
                                            <div key={dia.value} className="rounded-xl border p-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold">{dia.label}</p>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => adicionaHorario(tipo.value, dia.value)}
                                                    >
                                                        <Plus className="h-4 w-4" /> Adicionar período
                                                    </Button>
                                                </div>

                                                {horariosDoDia.length === 0 ? (
                                                    <p className="mt-2 text-xs text-muted-foreground">Fechado</p>
                                                ) : (
                                                    <div className="mt-3 space-y-2">
                                                        {horariosDoDia.map(({ horario, index }) => (
                                                            <div
                                                                key={index}
                                                                className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/40 p-2"
                                                            >
                                                                <Input
                                                                    type="time"
                                                                    className="w-auto"
                                                                    value={horario.hora_inicio}
                                                                    onChange={(e) =>
                                                                        atualizaHorario(
                                                                            tipo.value,
                                                                            index,
                                                                            "hora_inicio",
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                />
                                                                <span className="text-sm text-muted-foreground">até</span>
                                                                <Input
                                                                    type="time"
                                                                    className="w-auto"
                                                                    value={horario.hora_fim}
                                                                    onChange={(e) =>
                                                                        atualizaHorario(
                                                                            tipo.value,
                                                                            index,
                                                                            "hora_fim",
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                />
                                                                <div className="flex items-center gap-2">
                                                                    <Switch
                                                                        checked={horario.status}
                                                                        onCheckedChange={(checked) =>
                                                                            atualizaHorario(
                                                                                tipo.value,
                                                                                index,
                                                                                "status",
                                                                                checked,
                                                                            )
                                                                        }
                                                                    />
                                                                    <span className="text-xs text-muted-foreground">Ativo</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="ml-auto"
                                                                    aria-label="Remover período"
                                                                    onClick={() => removeHorario(tipo.value, index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 cursor-pointer text-destructive" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() => salvarGrade(tipo.value)}
                                            disabled={salvandoGrade === tipo.value}
                                        >
                                            {salvandoGrade === tipo.value ? (
                                                <>
                                                    <Spinner /> Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    <Clock /> Salvar grade de {tipo.label.toLowerCase()}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Bloqueios e feriados</CardTitle>
                        <CardDescription>
                            Períodos em que a loja não recebe pedidos, independente da grade e do funcionamento geral.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="titulo-bloqueio">Título</FieldLabel>
                                <Input
                                    id="titulo-bloqueio"
                                    placeholder="Ex: Feriado de Natal"
                                    value={novaIndisponibilidade.titulo}
                                    onChange={(e) =>
                                        setNovaIndisponibilidade((atual) => ({ ...atual, titulo: e.target.value }))
                                    }
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="descricao-bloqueio">Descrição</FieldLabel>
                                <Input
                                    id="descricao-bloqueio"
                                    placeholder="Opcional"
                                    value={novaIndisponibilidade.descricao}
                                    onChange={(e) =>
                                        setNovaIndisponibilidade((atual) => ({ ...atual, descricao: e.target.value }))
                                    }
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="data-inicio-bloqueio">Data inicial</FieldLabel>
                                <Input
                                    id="data-inicio-bloqueio"
                                    type="date"
                                    value={novaIndisponibilidade.data_inicio}
                                    onChange={(e) =>
                                        setNovaIndisponibilidade((atual) => ({
                                            ...atual,
                                            data_inicio: e.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="data-fim-bloqueio">Data final</FieldLabel>
                                <Input
                                    id="data-fim-bloqueio"
                                    type="date"
                                    value={novaIndisponibilidade.data_fim}
                                    onChange={(e) =>
                                        setNovaIndisponibilidade((atual) => ({ ...atual, data_fim: e.target.value }))
                                    }
                                />
                                <FieldDescription>A loja fica fechada durante todo o período.</FieldDescription>
                            </Field>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={cadastrarIndisponibilidade} disabled={salvandoIndisponibilidade}>
                                {salvandoIndisponibilidade ? (
                                    <>
                                        <Spinner /> Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Plus /> Adicionar bloqueio
                                    </>
                                )}
                            </Button>
                        </div>

                        {listaIndisponibilidades.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground/60">
                                <CalendarOff className="h-8 w-8" />
                                <p className="text-sm">Nenhum bloqueio cadastrado</p>
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y">
                                {listaIndisponibilidades.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-semibold">{item.titulo}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.data_inicio} até {item.data_fim}
                                                {item.descricao ? ` · ${item.descricao}` : ""}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removerIndisponibilidade(item.id)}
                                            disabled={removendoIndisponibilidade === item.id}
                                            aria-label="Remover bloqueio"
                                        >
                                            <Trash2 className="h-5 w-5 cursor-pointer text-destructive" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </LayoutAutenticado>
    );
}
