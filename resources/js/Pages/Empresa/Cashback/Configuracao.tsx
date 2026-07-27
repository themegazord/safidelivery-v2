import { useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
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
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import {
    ICashbackConfigData,
    TipoFuncionamento,
} from "@/types/empresa/cashback/types";

type ConfiguracaoProps = {
    cashbackConfig: ICashbackConfigData;
};

const TIPOS_FUNCIONAMENTO: { value: TipoFuncionamento; label: string }[] = [
    { value: "delivery", label: "Delivery" },
    { value: "retirada", label: "Retirada" },
    { value: "mesa", label: "Atendimento em mesa" },
];

export default function Configuracao({
    cashbackConfig: configuracaoInicial,
}: ConfiguracaoProps) {
    const { cnpj } = usePage<{ cnpj: string }>().props;
    const [config, setConfig] = useState<ICashbackConfigData>(
        configuracaoInicial,
    );
    const [salvando, setSalvando] = useState(false);

    function atualiza<K extends keyof ICashbackConfigData>(
        campo: K,
        valor: ICashbackConfigData[K],
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
                route("aplicacao.empresa.cashback.configuracao.update", {
                    cnpj,
                }),
                config,
            )
            .then((response) => toast.success(response.data.mensagem))
            .catch((error) =>
                toast.error(
                    error.response?.data?.message ??
                        "Não foi possível salvar a configuração de cashback",
                ),
            )
            .finally(() => setSalvando(false));
    }

    return (
        <LayoutAutenticado>
            <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Configuração do Cashback
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Defina como seus clientes recebem cashback nos
                        próximos pedidos.
                    </p>
                </header>

                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                Cashback ativo
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Ative para que os clientes recebam cashback
                                após cada pedido.
                            </p>
                        </div>
                        <Switch
                            checked={config.status}
                            onCheckedChange={(v) => atualiza("status", v)}
                        />
                    </CardContent>
                </Card>

                {config.status && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Tipo de cashback</CardTitle>
                                <CardDescription>
                                    Escolha como o cashback será calculado
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={config.cashback_tipo ?? undefined}
                                    onValueChange={(value) =>
                                        atualiza(
                                            "cashback_tipo",
                                            value as ICashbackConfigData["cashback_tipo"],
                                        )
                                    }
                                    className="grid gap-3 sm:grid-cols-2"
                                >
                                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                        <RadioGroupItem value="porcentagem" />
                                        <span className="font-medium">
                                            % Porcentagem
                                        </span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                        <RadioGroupItem value="fixo" />
                                        <span className="font-medium">
                                            R$ Fixo
                                        </span>
                                    </label>
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Valor do cashback</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {config.cashback_tipo === "porcentagem" ? (
                                    <>
                                        <Field className="max-w-xs">
                                            <FieldLabel htmlFor="cashback_porcentagem">
                                                Percentual (%)
                                            </FieldLabel>
                                            <Input
                                                id="cashback_porcentagem"
                                                type="number"
                                                min={0}
                                                max={100}
                                                step="0.01"
                                                placeholder="Ex: 5"
                                                value={
                                                    config.cashback_porcentagem ??
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    atualiza(
                                                        "cashback_porcentagem",
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
                                                Percentual do valor do pedido
                                                devolvido como cashback.
                                            </FieldDescription>
                                        </Field>

                                        <Field>
                                            <FieldLabel>
                                                Base de cálculo do percentual
                                            </FieldLabel>
                                            <RadioGroup
                                                value={
                                                    config.base_calculo_porcentagem
                                                }
                                                onValueChange={(value) =>
                                                    atualiza(
                                                        "base_calculo_porcentagem",
                                                        value as ICashbackConfigData["base_calculo_porcentagem"],
                                                    )
                                                }
                                                className="gap-3"
                                            >
                                                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                                    <RadioGroupItem
                                                        value="subtotal"
                                                        className="mt-0.5"
                                                    />
                                                    <div>
                                                        <p className="font-medium">
                                                            Subtotal dos
                                                            produtos
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Calcula sobre o
                                                            valor total dos
                                                            itens do pedido.
                                                        </p>
                                                    </div>
                                                </label>
                                                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                                    <RadioGroupItem
                                                        value="subtotal_liquido"
                                                        className="mt-0.5"
                                                    />
                                                    <div>
                                                        <p className="font-medium">
                                                            Subtotal líquido
                                                            (subtotal −
                                                            cashback usado)
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Calcula sobre o
                                                            valor dos itens já
                                                            descontado o
                                                            cashback utilizado
                                                            neste pedido.
                                                        </p>
                                                    </div>
                                                </label>
                                            </RadioGroup>
                                        </Field>
                                    </>
                                ) : (
                                    <Field className="max-w-xs">
                                        <FieldLabel htmlFor="cashback_fixo">
                                            Valor fixo (R$)
                                        </FieldLabel>
                                        <Input
                                            id="cashback_fixo"
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            placeholder="Ex: 2.00"
                                            value={config.cashback_fixo ?? ""}
                                            onChange={(e) =>
                                                atualiza(
                                                    "cashback_fixo",
                                                    e.target.value === ""
                                                        ? null
                                                        : Number(
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                        />
                                        <FieldDescription>
                                            Valor fixo devolvido como
                                            cashback por pedido.
                                        </FieldDescription>
                                    </Field>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Validade</CardTitle>
                                <CardDescription>
                                    Por quantos dias o cashback fica
                                    disponível para o cliente
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Field className="max-w-xs">
                                    <FieldLabel htmlFor="dias_validade">
                                        Dias de validade
                                    </FieldLabel>
                                    <Input
                                        id="dias_validade"
                                        type="number"
                                        min={1}
                                        placeholder="Ex: 30"
                                        value={config.dias_validade ?? ""}
                                        onChange={(e) =>
                                            atualiza(
                                                "dias_validade",
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
                                    Em quais tipos de pedido o cashback é
                                    gerado
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
