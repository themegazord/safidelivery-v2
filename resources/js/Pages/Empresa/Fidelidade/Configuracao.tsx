import { useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
import { Check } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import {
    ICategoriaOption,
    IFidelidadeConfigData,
    TipoFuncionamento,
} from "@/types/empresa/fidelidade/types";

type ConfiguracaoProps = {
    fidelidadeConfig: IFidelidadeConfigData;
    categoriasOptions: ICategoriaOption[];
};

const TIPOS_FUNCIONAMENTO: { value: TipoFuncionamento; label: string }[] = [
    { value: "delivery", label: "Delivery" },
    { value: "retirada", label: "Retirada" },
    { value: "mesa", label: "Atendimento em mesa" },
];

export default function Configuracao({
    fidelidadeConfig: configuracaoInicial,
    categoriasOptions,
}: ConfiguracaoProps) {
    const { cnpj } = usePage<{ cnpj: string }>().props;
    const [config, setConfig] = useState<IFidelidadeConfigData>(
        configuracaoInicial,
    );
    const [salvando, setSalvando] = useState(false);

    function atualiza<K extends keyof IFidelidadeConfigData>(
        campo: K,
        valor: IFidelidadeConfigData[K],
    ) {
        setConfig((atual) => ({ ...atual, [campo]: valor }));
    }

    function toggleTipoFuncionamento(tipo: TipoFuncionamento) {
        atualiza(
            "tipos_funcionamento",
            config.tipos_funcionamento.includes(tipo)
                ? config.tipos_funcionamento.filter((t) => t !== tipo)
                : [...config.tipos_funcionamento, tipo],
        );
    }

    async function salvar() {
        setSalvando(true);
        await axios
            .post(
                route("aplicacao.empresa.fidelidade.configuracao.update", {
                    cnpj,
                }),
                config,
            )
            .then((response) => toast.success(response.data.mensagem))
            .catch((error) =>
                toast.error(
                    error.response?.data?.message ??
                        "Não foi possível salvar o programa de fidelidade",
                ),
            )
            .finally(() => setSalvando(false));
    }

    return (
        <LayoutAutenticado>
            <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Programa de Fidelidade
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Defina as regras para recompensar seus clientes mais
                        frequentes.
                    </p>
                </header>

                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                Programa ativo
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Ative para que os pedidos comecem a acumular
                                progresso rumo à recompensa.
                            </p>
                        </div>
                        <Switch
                            checked={config.ativo}
                            onCheckedChange={(v) => atualiza("ativo", v)}
                        />
                    </CardContent>
                </Card>

                {config.ativo && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Gatilho</CardTitle>
                                <CardDescription>
                                    O que o cliente precisa acumular para
                                    ganhar a recompensa
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <RadioGroup
                                    value={config.tipo_gatilho ?? undefined}
                                    onValueChange={(value) =>
                                        atualiza(
                                            "tipo_gatilho",
                                            value as IFidelidadeConfigData["tipo_gatilho"],
                                        )
                                    }
                                    className="grid gap-3 sm:grid-cols-2"
                                >
                                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                        <RadioGroupItem value="qtd_pedidos" />
                                        <span className="font-medium">
                                            Quantidade de pedidos
                                        </span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                        <RadioGroupItem value="valor_acumulado" />
                                        <span className="font-medium">
                                            Valor acumulado em R$
                                        </span>
                                    </label>
                                </RadioGroup>

                                <Field className="max-w-xs">
                                    <FieldLabel htmlFor="valor_gatilho">
                                        {config.tipo_gatilho ===
                                        "valor_acumulado"
                                            ? "Valor a acumular (R$)"
                                            : "Quantidade de pedidos"}
                                    </FieldLabel>
                                    <Input
                                        id="valor_gatilho"
                                        type="number"
                                        min={1}
                                        step={
                                            config.tipo_gatilho ===
                                            "valor_acumulado"
                                                ? "0.01"
                                                : "1"
                                        }
                                        value={config.valor_gatilho ?? ""}
                                        onChange={(e) =>
                                            atualiza(
                                                "valor_gatilho",
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value),
                                            )
                                        }
                                    />
                                </Field>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recompensa</CardTitle>
                                <CardDescription>
                                    O que o cliente ganha ao atingir a meta
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <RadioGroup
                                    value={
                                        config.tipo_recompensa ?? undefined
                                    }
                                    onValueChange={(value) =>
                                        atualiza(
                                            "tipo_recompensa",
                                            value as IFidelidadeConfigData["tipo_recompensa"],
                                        )
                                    }
                                    className="grid gap-3 sm:grid-cols-2"
                                >
                                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                        <RadioGroupItem value="item_gratis" />
                                        <span className="font-medium">
                                            Item grátis
                                        </span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                        <RadioGroupItem value="frete_gratis" />
                                        <span className="font-medium">
                                            Frete grátis
                                        </span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                        <RadioGroupItem value="desconto_percentual" />
                                        <span className="font-medium">
                                            % Desconto percentual
                                        </span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                        <RadioGroupItem value="desconto_fixo" />
                                        <span className="font-medium">
                                            R$ Desconto fixo
                                        </span>
                                    </label>
                                </RadioGroup>

                                {(config.tipo_recompensa ===
                                    "desconto_percentual" ||
                                    config.tipo_recompensa ===
                                        "desconto_fixo") && (
                                    <Field className="max-w-xs">
                                        <FieldLabel htmlFor="valor_recompensa">
                                            {config.tipo_recompensa ===
                                            "desconto_percentual"
                                                ? "Percentual (%)"
                                                : "Valor fixo (R$)"}
                                        </FieldLabel>
                                        <Input
                                            id="valor_recompensa"
                                            type="number"
                                            min={0}
                                            max={
                                                config.tipo_recompensa ===
                                                "desconto_percentual"
                                                    ? 100
                                                    : undefined
                                            }
                                            step="0.01"
                                            value={
                                                config.valor_recompensa ?? ""
                                            }
                                            onChange={(e) =>
                                                atualiza(
                                                    "valor_recompensa",
                                                    e.target.value === ""
                                                        ? null
                                                        : Number(
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                        />
                                    </Field>
                                )}

                                {config.tipo_recompensa ===
                                    "desconto_percentual" && (
                                    <Field>
                                        <FieldLabel>
                                            Base de cálculo do percentual
                                        </FieldLabel>
                                        <RadioGroup
                                            value={
                                                config.base_calculo_desconto
                                            }
                                            onValueChange={(value) =>
                                                atualiza(
                                                    "base_calculo_desconto",
                                                    value as IFidelidadeConfigData["base_calculo_desconto"],
                                                )
                                            }
                                            className="gap-3"
                                        >
                                            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                                <RadioGroupItem
                                                    value="subtotal_itens"
                                                    className="mt-0.5"
                                                />
                                                <div>
                                                    <p className="font-medium">
                                                        Subtotal dos itens
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Calcula sobre o valor
                                                        dos itens do pedido
                                                        (exceto prêmios).
                                                    </p>
                                                </div>
                                            </label>
                                            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                                <RadioGroupItem
                                                    value="total_pedido"
                                                    className="mt-0.5"
                                                />
                                                <div>
                                                    <p className="font-medium">
                                                        Total do pedido
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Calcula sobre o valor
                                                        total do pedido,
                                                        incluindo frete.
                                                    </p>
                                                </div>
                                            </label>
                                        </RadioGroup>
                                    </Field>
                                )}

                                {config.tipo_recompensa === "item_gratis" && (
                                    <div className="space-y-4">
                                        <Field className="max-w-xs">
                                            <FieldLabel htmlFor="valor_max_premio">
                                                Valor máximo do prêmio (R$)
                                            </FieldLabel>
                                            <Input
                                                id="valor_max_premio"
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                placeholder="Sem limite"
                                                value={
                                                    config.valor_max_premio ??
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    atualiza(
                                                        "valor_max_premio",
                                                        e.target.value === ""
                                                            ? null
                                                            : Number(
                                                                  e.target
                                                                      .value,
                                                              ),
                                                    )
                                                }
                                            />
                                            <FieldDescription>
                                                Itens acima desse valor não
                                                poderão ser resgatados. Deixe
                                                em branco para não limitar.
                                            </FieldDescription>
                                        </Field>

                                        {categoriasOptions.length > 0 && (
                                            <Field>
                                                <FieldLabel>
                                                    Categorias bloqueadas
                                                </FieldLabel>
                                                <ToggleGroup
                                                    type="multiple"
                                                    variant="outline"
                                                    value={config.categorias_bloqueadas.map(
                                                        String,
                                                    )}
                                                    onValueChange={(value) =>
                                                        atualiza(
                                                            "categorias_bloqueadas",
                                                            value.map(Number),
                                                        )
                                                    }
                                                    className="flex-wrap"
                                                >
                                                    {categoriasOptions.map(
                                                        (categoria) => (
                                                            <ToggleGroupItem
                                                                key={
                                                                    categoria.value
                                                                }
                                                                value={String(
                                                                    categoria.value,
                                                                )}
                                                            >
                                                                {config.categorias_bloqueadas.includes(
                                                                    categoria.value,
                                                                ) && (
                                                                    <Check />
                                                                )}
                                                                {
                                                                    categoria.label
                                                                }
                                                            </ToggleGroupItem>
                                                        ),
                                                    )}
                                                </ToggleGroup>
                                                <FieldDescription>
                                                    Itens dessas categorias
                                                    não poderão ser resgatados
                                                    como prêmio.
                                                </FieldDescription>
                                            </Field>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Validade</CardTitle>
                                <CardDescription>
                                    Por quantos dias a recompensa fica
                                    disponível para o cliente após ser
                                    conquistada
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Field className="max-w-xs">
                                    <FieldLabel htmlFor="validade_dias">
                                        Dias de validade
                                    </FieldLabel>
                                    <Input
                                        id="validade_dias"
                                        type="number"
                                        min={1}
                                        placeholder="Sem prazo"
                                        value={config.validade_dias ?? ""}
                                        onChange={(e) =>
                                            atualiza(
                                                "validade_dias",
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value),
                                            )
                                        }
                                    />
                                </Field>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tipos de atendimento</CardTitle>
                                <CardDescription>
                                    Em quais tipos de pedido o progresso é
                                    acumulado
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {TIPOS_FUNCIONAMENTO.map((tipo) => (
                                    <div
                                        key={tipo.value}
                                        className="flex items-center justify-between rounded-lg bg-muted p-4"
                                    >
                                        <p className="text-sm font-medium">
                                            {tipo.label}
                                        </p>
                                        <Switch
                                            checked={config.tipos_funcionamento.includes(
                                                tipo.value,
                                            )}
                                            onCheckedChange={() =>
                                                toggleTipoFuncionamento(
                                                    tipo.value,
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </>
                )}

                <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-background/80 py-4 backdrop-blur">
                    <Button onClick={salvar} disabled={salvando}>
                        {salvando ? (
                            <>
                                <Spinner /> Salvando...
                            </>
                        ) : (
                            "Salvar alterações"
                        )}
                    </Button>
                </div>
            </div>
        </LayoutAutenticado>
    );
}
