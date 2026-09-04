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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";

type ConfiguracoesData = {
    aceite_automatico: boolean;
    aceite_automatico_ifood: boolean;
    media_tempo_preparo: string | null;
    modo_calculo_frete: number | null;
    replicar_informacao_importacao: boolean;
    informa_mesa_comanda: boolean;
    modo_atendente: boolean;
    periodo_inatividade_cliente: number | null;
    fora_area_entrega: "bloquear" | "taxa_maxima";
    multiplas_formas_pagamento: boolean;
    whatsapp_notificacao_status_pedido: boolean;
};

type ModoCalculoOption = {
    value: number;
    label: string;
};

type ConfiguracoesProps = {
    configuracoes: ConfiguracoesData;
    modoCalculoOptions: ModoCalculoOption[];
};

type ToggleRowProps = {
    label: string;
    descricao: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
};

function ToggleRow({ label, descricao, checked, onCheckedChange }: ToggleRowProps) {
    return (
        <div className="flex items-start gap-4 rounded-lg bg-muted p-4">
            <div className="flex-1">
                <p className="mb-1 text-sm font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{descricao}</p>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                className="mt-1 shrink-0"
            />
        </div>
    );
}

export default function Configuracoes({
    configuracoes: configuracoesIniciais,
    modoCalculoOptions,
}: ConfiguracoesProps) {
    const { cnpj } = usePage<{ cnpj: string }>().props;
    const [configuracoes, setConfiguracoes] = useState<ConfiguracoesData>(
        configuracoesIniciais,
    );
    const [saving, setSaving] = useState(false);

    function atualiza<K extends keyof ConfiguracoesData>(
        campo: K,
        valor: ConfiguracoesData[K],
    ) {
        setConfiguracoes((atual) => ({ ...atual, [campo]: valor }));
    }

    async function salvar() {
        setSaving(true);
        await axios
            .post(
                route("aplicacao.empresa.configempresa.configuracoes.update", {
                    cnpj,
                }),
                configuracoes,
            )
            .then((response) => toast.success(response.data.mensagem))
            .catch((error) =>
                toast.error(
                    error.response?.data?.message ??
                        "Não foi possível salvar as configurações",
                ),
            )
            .finally(() => setSaving(false));
    }

    return (
        <LayoutAutenticado>
            <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Configurações do Sistema
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Gerencie as configurações operacionais do seu
                        estabelecimento
                    </p>
                </header>

                <Tabs defaultValue="pedidos">
                    <TabsList>
                        <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
                        <TabsTrigger value="entrega">Entrega</TabsTrigger>
                        <TabsTrigger value="importacoes">
                            Importações
                        </TabsTrigger>
                        <TabsTrigger value="fidelidade">
                            Fidelidade e Cashback
                        </TabsTrigger>
                        <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pedidos" className="space-y-6 pb-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Aceite automático de pedidos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ToggleRow
                                    label="Pedidos diretos"
                                    descricao="Aceita automaticamente pedidos feitos diretamente pelo app ou site"
                                    checked={configuracoes.aceite_automatico}
                                    onCheckedChange={(v) =>
                                        atualiza("aceite_automatico", v)
                                    }
                                />
                                <ToggleRow
                                    label="Pedidos do iFood"
                                    descricao="Aceita automaticamente pedidos vindos da plataforma iFood"
                                    checked={
                                        configuracoes.aceite_automatico_ifood
                                    }
                                    onCheckedChange={(v) =>
                                        atualiza(
                                            "aceite_automatico_ifood",
                                            v,
                                        )
                                    }
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Atendimento</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ToggleRow
                                    label="Identificação de comanda pelo cliente"
                                    descricao="Quando ativado, o cliente deverá informar o número da comanda ao fazer o pedido."
                                    checked={
                                        configuracoes.informa_mesa_comanda
                                    }
                                    onCheckedChange={(v) =>
                                        atualiza("informa_mesa_comanda", v)
                                    }
                                />
                                <ToggleRow
                                    label="Modo atendente"
                                    descricao="Quando ativado, os pedidos serão registrados pelos seus funcionários. Quando desativado, o cliente faz o pedido diretamente pelo cardápio digital (auto-atendimento)."
                                    checked={configuracoes.modo_atendente}
                                    onCheckedChange={(v) =>
                                        atualiza("modo_atendente", v)
                                    }
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pagamento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ToggleRow
                                    label="Múltiplas formas de pagamento"
                                    descricao="Permite ao cliente dividir o pagamento entre mais de uma forma de pagamento. Ex: parte em dinheiro, parte em cartão."
                                    checked={
                                        configuracoes.multiplas_formas_pagamento
                                    }
                                    onCheckedChange={(v) =>
                                        atualiza(
                                            "multiplas_formas_pagamento",
                                            v,
                                        )
                                    }
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="entrega" className="space-y-6 pb-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tempo de preparo</CardTitle>
                                <CardDescription>
                                    Define o tempo estimado para preparar os
                                    pedidos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Field className="max-w-xs">
                                    <FieldLabel htmlFor="media_tempo_preparo">
                                        Tempo médio de preparo
                                    </FieldLabel>
                                    <Input
                                        id="media_tempo_preparo"
                                        type="time"
                                        value={
                                            configuracoes.media_tempo_preparo ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            atualiza(
                                                "media_tempo_preparo",
                                                e.target.value || null,
                                            )
                                        }
                                    />
                                    <FieldDescription>
                                        Este tempo será exibido para os
                                        clientes como estimativa de preparo
                                        dos pedidos
                                    </FieldDescription>
                                </Field>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Modo de cálculo de tempo de entrega
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Field className="max-w-md">
                                    <FieldLabel htmlFor="modo_calculo_frete">
                                        Selecione o modo de cálculo
                                    </FieldLabel>
                                    <Select
                                        value={
                                            configuracoes.modo_calculo_frete
                                                ? String(
                                                      configuracoes.modo_calculo_frete,
                                                  )
                                                : undefined
                                        }
                                        onValueChange={(value) =>
                                            atualiza(
                                                "modo_calculo_frete",
                                                Number(value),
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            id="modo_calculo_frete"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Escolha como calcular o tempo de entrega" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modoCalculoOptions.map(
                                                (opcao) => (
                                                    <SelectItem
                                                        key={opcao.value}
                                                        value={String(
                                                            opcao.value,
                                                        )}
                                                    >
                                                        {opcao.label}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FieldDescription>
                                        Define como será calculado o tempo
                                        estimado de entrega para os clientes
                                    </FieldDescription>
                                </Field>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Fora da área de entrega
                                </CardTitle>
                                <CardDescription>
                                    Define o que acontece quando o cliente
                                    está fora dos raios de entrega
                                    cadastrados.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={configuracoes.fora_area_entrega}
                                    onValueChange={(value) =>
                                        atualiza(
                                            "fora_area_entrega",
                                            value as ConfiguracoesData["fora_area_entrega"],
                                        )
                                    }
                                    className="grid gap-3 sm:grid-cols-2"
                                >
                                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-destructive has-[[data-checked]]:bg-destructive/5">
                                        <RadioGroupItem
                                            value="bloquear"
                                            id="fora_area_entrega_bloquear"
                                            className="mt-0.5"
                                        />
                                        <div>
                                            <p className="font-medium">
                                                Bloquear pedido
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                O cliente não consegue
                                                finalizar o pedido e é
                                                informado que está fora da
                                                área de entrega.
                                            </p>
                                        </div>
                                    </label>
                                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                        <RadioGroupItem
                                            value="taxa_maxima"
                                            id="fora_area_entrega_taxa_maxima"
                                            className="mt-0.5"
                                        />
                                        <div>
                                            <p className="font-medium">
                                                Cobrar taxa máxima
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                O pedido é permitido e será
                                                cobrada a taxa da faixa de
                                                entrega mais distante
                                                cadastrada.
                                            </p>
                                        </div>
                                    </label>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="importacoes" className="pb-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Sincronização de cardápio
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ToggleRow
                                    label="Replicar alterações para o iFood"
                                    descricao='Quando ativado, todas as alterações feitas no cardápio importado serão automaticamente replicadas para o iFood. Inclui: criação, edição e exclusão de categorias, itens, preços e complementos.'
                                    checked={
                                        configuracoes.replicar_informacao_importacao
                                    }
                                    onCheckedChange={(v) =>
                                        atualiza(
                                            "replicar_informacao_importacao",
                                            v,
                                        )
                                    }
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="fidelidade" className="pb-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Inatividade dos clientes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-4 rounded-lg bg-muted p-4">
                                    <div className="flex-1">
                                        <p className="mb-1 text-sm font-medium">
                                            Quantos dias você quer considerar
                                            seus clientes como inativos na
                                            rotina de clientes?
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Essa configuração é importante,
                                            pois, com ela, você consegue ter
                                            um teto de onde partir para
                                            encaminhar cupons específicos
                                            para esses clientes, incentivando
                                            a fidelidade do cliente.
                                        </p>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Observação: isso não é uma
                                            trava, é uma configuração
                                            informativa, seu cliente não terá
                                            ideia dessa "inativação"
                                        </p>
                                    </div>
                                    <Input
                                        type="number"
                                        min={0}
                                        className="w-24 shrink-0"
                                        value={
                                            configuracoes.periodo_inatividade_cliente ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            atualiza(
                                                "periodo_inatividade_cliente",
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="whatsapp" className="pb-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notificações de WhatsApp</CardTitle>
                                <CardDescription>
                                    Avise automaticamente o cliente por
                                    WhatsApp a cada mudança de status do
                                    pedido
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ToggleRow
                                    label="Notificações ativas"
                                    descricao="Quando ativo, o cliente recebe uma mensagem de WhatsApp sempre que o pedido avançar de status (aceito, saiu para entrega, entregue etc.), se houver telefone cadastrado."
                                    checked={
                                        configuracoes.whatsapp_notificacao_status_pedido
                                    }
                                    onCheckedChange={(v) =>
                                        atualiza(
                                            "whatsapp_notificacao_status_pedido",
                                            v,
                                        )
                                    }
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-background/80 py-4 backdrop-blur">
                    <Button onClick={salvar} disabled={saving}>
                        {saving ? (
                            <>
                                <Spinner /> Salvando...
                            </>
                        ) : (
                            "Salvar configurações"
                        )}
                    </Button>
                </div>
            </div>
        </LayoutAutenticado>
    );
}
