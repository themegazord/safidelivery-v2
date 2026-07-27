import { useState } from "react";
import {
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Minus,
    Percent,
    Plus,
    ShoppingBag,
    Ticket,
    Truck,
    Users,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    DIAS_SEMANA,
    IPromocaoFormData,
} from "@/types/empresa/promocoes/types";

const TABS = [
    "informacoes",
    "tipo-cupom",
    "uso-cupom",
    "disponibilidade",
] as const;

type TabPromocao = (typeof TABS)[number];

type FormularioPromocaoProps = {
    titulo: string;
    subtitulo: string;
    valoresIniciais: IPromocaoFormData;
    aoSalvar: (dados: IPromocaoFormData) => void;
    aoCancelar: () => void;
    labelBotaoFinal: string;
    salvando: boolean;
    erros: Record<string, string[]>;
};

function erroDe(erros: Record<string, string[]>, campo: string) {
    return erros[campo]?.[0];
}

function CartaoSelecao({
    ativo,
    onClick,
    icon,
    titulo,
    descricao,
    corAtiva,
}: {
    ativo: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    titulo: string;
    descricao: string;
    corAtiva: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "cursor-pointer rounded-xl border-2 p-6 text-left transition-all hover:border-primary/40",
                ativo ? corAtiva : "border-border",
            )}
        >
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="font-semibold text-foreground">
                        {titulo}
                    </span>
                </div>
                {ativo && (
                    <CheckCircle2 className="size-5 text-primary" />
                )}
            </div>
            <p className="text-xs text-muted-foreground">{descricao}</p>
        </button>
    );
}

function Estepe({
    valor,
    onChange,
    className,
}: {
    valor: number;
    onChange: (valor: number) => void;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex w-fit items-center gap-2 rounded-lg border border-border bg-background p-2",
                className,
            )}
        >
            <Button
                type="button"
                size="icon-sm"
                variant="outline"
                disabled={valor === 0}
                onClick={() => onChange(Math.max(0, valor - 1))}
            >
                <Minus />
            </Button>
            <Input
                type="number"
                min={0}
                value={valor}
                onChange={(e) => onChange(Number(e.target.value) || 0)}
                className="w-16 border-none text-center text-lg font-bold shadow-none focus-visible:ring-0"
            />
            <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={() => onChange(valor + 1)}
            >
                <Plus />
            </Button>
        </div>
    );
}

export default function FormularioPromocao({
    titulo,
    subtitulo,
    valoresIniciais,
    aoSalvar,
    aoCancelar,
    labelBotaoFinal,
    salvando,
    erros,
}: FormularioPromocaoProps) {
    const [dados, setDados] = useState<IPromocaoFormData>(valoresIniciais);
    const [tab, setTab] = useState<TabPromocao>("informacoes");

    function atualiza<K extends keyof IPromocaoFormData>(
        campo: K,
        valor: IPromocaoFormData[K],
    ) {
        setDados((atual) => ({ ...atual, [campo]: valor }));
    }

    function indiceTab() {
        return TABS.indexOf(tab);
    }

    function irParaProxima() {
        setTab(TABS[Math.min(TABS.length - 1, indiceTab() + 1)]);
    }

    function irParaAnterior() {
        setTab(TABS[Math.max(0, indiceTab() - 1)]);
    }

    return (
        <div className="w-full px-4 py-6 lg:px-8 lg:py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                    {titulo}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {subtitulo}
                </p>
            </header>

            <div className="mb-6 flex w-fit gap-1 rounded-lg bg-muted p-1">
                {[
                    { id: "informacoes", label: "Informações" },
                    { id: "tipo-cupom", label: "Tipo de cupom" },
                    { id: "uso-cupom", label: "Uso do cupom" },
                    { id: "disponibilidade", label: "Disponibilidade" },
                ].map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setTab(item.id as TabPromocao)}
                        className={cn(
                            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            tab === item.id
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {tab === "informacoes" && (
                <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
                    <div className="mb-8">
                        <h2 className="mb-1 text-2xl font-bold text-foreground">
                            Informações do Cupom
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Defina o código e a descrição do cupom
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                            <Field data-invalid={!!erroDe(erros, "nome_cupom")}>
                                <FieldLabel htmlFor="nome_cupom">
                                    Código do Cupom
                                </FieldLabel>
                                <Input
                                    id="nome_cupom"
                                    placeholder="Ex: DESCONTO20"
                                    className="uppercase"
                                    value={dados.nome_cupom}
                                    onChange={(e) =>
                                        atualiza(
                                            "nome_cupom",
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                />
                                {erroDe(erros, "nome_cupom") ? (
                                    <FieldError>
                                        {erroDe(erros, "nome_cupom")}
                                    </FieldError>
                                ) : (
                                    <FieldDescription>
                                        Este código será usado pelos
                                        clientes no checkout
                                    </FieldDescription>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="status">
                                    Status
                                </FieldLabel>
                                <Select
                                    value={dados.status}
                                    onValueChange={(value) =>
                                        atualiza(
                                            "status",
                                            value as IPromocaoFormData["status"],
                                        )
                                    }
                                >
                                    <SelectTrigger id="status" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ativo">
                                            Ativo
                                        </SelectItem>
                                        <SelectItem value="inativo">
                                            Inativo
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>

                        <Field data-invalid={!!erroDe(erros, "descricao_cupom")}>
                            <FieldLabel htmlFor="descricao_cupom">
                                Descrição do Cupom
                            </FieldLabel>
                            <Textarea
                                id="descricao_cupom"
                                placeholder="Ex: Ganhe 20% de desconto em compras acima de R$ 50,00"
                                rows={3}
                                value={dados.descricao_cupom}
                                onChange={(e) =>
                                    atualiza("descricao_cupom", e.target.value)
                                }
                            />
                            {erroDe(erros, "descricao_cupom") ? (
                                <FieldError>
                                    {erroDe(erros, "descricao_cupom")}
                                </FieldError>
                            ) : (
                                <FieldDescription>
                                    Breve descrição que aparece para o
                                    cliente
                                </FieldDescription>
                            )}
                        </Field>

                        <div className="flex items-center justify-between rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
                            <div>
                                <p className="text-sm font-medium">
                                    Válido apenas para clientes novos
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Restringe o cupom ao primeiro pedido de
                                    cada cliente
                                </p>
                            </div>
                            <Switch
                                checked={dados.valido_cliente_novo}
                                onCheckedChange={(v) =>
                                    atualiza("valido_cliente_novo", v)
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
                            <div>
                                <p className="text-sm font-medium">
                                    Cupom de uso único?
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Cada cliente pode usar apenas uma vez
                                </p>
                            </div>
                            <Switch
                                checked={dados.uso_unico}
                                onCheckedChange={(v) =>
                                    atualiza("uso_unico", v)
                                }
                            />
                        </div>

                        <div className="border-t border-border pt-6">
                            <p className="mb-4 text-sm font-semibold text-foreground">
                                Aplicar desconto em:
                            </p>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <CartaoSelecao
                                    ativo={dados.onde_afetara === "produto"}
                                    onClick={() =>
                                        atualiza("onde_afetara", "produto")
                                    }
                                    icon={
                                        <ShoppingBag className="size-6 text-primary" />
                                    }
                                    titulo="Produtos"
                                    descricao="Desconto aplicado no valor total dos produtos"
                                    corAtiva="border-primary bg-primary/5"
                                />
                                <CartaoSelecao
                                    ativo={dados.onde_afetara === "frete"}
                                    onClick={() =>
                                        atualiza("onde_afetara", "frete")
                                    }
                                    icon={
                                        <Truck className="size-6 text-primary" />
                                    }
                                    titulo="Frete"
                                    descricao="Desconto aplicado na taxa de entrega"
                                    corAtiva="border-primary bg-primary/5"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between border-t border-border pt-6">
                        <Button type="button" variant="ghost" onClick={aoCancelar}>
                            <X /> Cancelar
                        </Button>
                        <Button type="button" onClick={irParaProxima}>
                            Próximo <ChevronRight />
                        </Button>
                    </div>
                </div>
            )}

            {tab === "tipo-cupom" && (
                <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
                    <div className="mb-8">
                        <h2 className="mb-1 text-2xl font-bold text-foreground">
                            Tipo de Desconto
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Defina como o desconto será calculado
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <CartaoSelecao
                                ativo={dados.tipo_cupom === "reais"}
                                onClick={() => atualiza("tipo_cupom", "reais")}
                                icon={
                                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                        R$
                                    </span>
                                }
                                titulo="Reais (R$)"
                                descricao="Valor fixo de desconto"
                                corAtiva="border-green-500 bg-green-500/5"
                            />
                            <CartaoSelecao
                                ativo={dados.tipo_cupom === "porcentagem"}
                                onClick={() =>
                                    atualiza("tipo_cupom", "porcentagem")
                                }
                                icon={
                                    <Percent className="size-6 text-blue-600 dark:text-blue-400" />
                                }
                                titulo="Porcentagem (%)"
                                descricao="Percentual sobre o valor"
                                corAtiva="border-blue-500 bg-blue-500/5"
                            />
                        </div>

                        <div className="border-t border-border pt-6">
                            <p className="mb-4 text-sm font-semibold text-foreground">
                                Valores do Desconto
                            </p>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field data-invalid={!!erroDe(erros, "valor_desconto")}>
                                    <FieldLabel htmlFor="valor_desconto">
                                        {dados.tipo_cupom === "porcentagem"
                                            ? "Percentual de Desconto"
                                            : "Valor do Desconto"}
                                    </FieldLabel>
                                    <Input
                                        id="valor_desconto"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={dados.valor_desconto}
                                        onChange={(e) =>
                                            atualiza(
                                                "valor_desconto",
                                                Number(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    <FieldDescription>
                                        {erroDe(erros, "valor_desconto") ??
                                            (dados.tipo_cupom === "porcentagem"
                                                ? "Ex: 20 para 20%"
                                                : "Valor fixo descontado")}
                                    </FieldDescription>
                                </Field>

                                <Field data-invalid={!!erroDe(erros, "valor_minimo_pedido")}>
                                    <FieldLabel htmlFor="valor_minimo_pedido">
                                        Pedido Mínimo
                                    </FieldLabel>
                                    <Input
                                        id="valor_minimo_pedido"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={dados.valor_minimo_pedido}
                                        onChange={(e) =>
                                            atualiza(
                                                "valor_minimo_pedido",
                                                Number(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    <FieldDescription>
                                        {erroDe(
                                            erros,
                                            "valor_minimo_pedido",
                                        ) ?? "R$ 0,00 = sem mínimo"}
                                    </FieldDescription>
                                </Field>

                                {dados.tipo_cupom === "porcentagem" && (
                                    <Field
                                        data-invalid={
                                            !!erroDe(
                                                erros,
                                                "valor_maximo_desconto",
                                            )
                                        }
                                    >
                                        <FieldLabel htmlFor="valor_maximo_desconto">
                                            Desconto Máximo
                                        </FieldLabel>
                                        <Input
                                            id="valor_maximo_desconto"
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={dados.valor_maximo_desconto}
                                            onChange={(e) =>
                                                atualiza(
                                                    "valor_maximo_desconto",
                                                    Number(e.target.value) ||
                                                        0,
                                                )
                                            }
                                        />
                                        <FieldDescription>
                                            {erroDe(
                                                erros,
                                                "valor_maximo_desconto",
                                            ) ?? "R$ 0,00 = sem limite"}
                                        </FieldDescription>
                                    </Field>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between border-t border-border pt-6">
                        <Button type="button" variant="ghost" onClick={irParaAnterior}>
                            <ChevronLeft /> Voltar
                        </Button>
                        <Button type="button" onClick={irParaProxima}>
                            Próximo <ChevronRight />
                        </Button>
                    </div>
                </div>
            )}

            {tab === "uso-cupom" && (
                <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
                    <div className="mb-8">
                        <h2 className="mb-1 text-2xl font-bold text-foreground">
                            Limite de Uso
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Configure quantas vezes o cupom pode ser
                            utilizado
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="rounded-xl bg-muted p-6">
                            <div className="mb-6 flex items-center gap-3">
                                <Users className="size-6 text-primary" />
                                <h3 className="text-lg font-semibold text-foreground">
                                    Limite por Cliente
                                </h3>
                            </div>

                            <RadioGroup
                                value={dados.qtde_clientes_usabilidade}
                                onValueChange={(value) =>
                                    atualiza(
                                        "qtde_clientes_usabilidade",
                                        value as IPromocaoFormData["qtde_clientes_usabilidade"],
                                    )
                                }
                                className="gap-4"
                            >
                                <label
                                    className={cn(
                                        "flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all hover:bg-background",
                                        dados.qtde_clientes_usabilidade ===
                                            "ilimitado"
                                            ? "border-primary bg-background"
                                            : "border-border",
                                    )}
                                >
                                    <RadioGroupItem
                                        value="ilimitado"
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            Ilimitado
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Qualquer cliente pode usar, sem
                                            limite por pessoa
                                        </p>
                                    </div>
                                </label>

                                <label
                                    className={cn(
                                        "flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all hover:bg-background",
                                        dados.qtde_clientes_usabilidade ===
                                            "limitado"
                                            ? "border-primary bg-background"
                                            : "border-border",
                                    )}
                                >
                                    <RadioGroupItem
                                        value="limitado"
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">
                                            Limitado
                                        </p>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            Cada cliente pode usar apenas X
                                            vezes
                                        </p>
                                        {dados.qtde_clientes_usabilidade ===
                                            "limitado" && (
                                            <Estepe
                                                valor={dados.qtde_clientes}
                                                onChange={(v) =>
                                                    atualiza(
                                                        "qtde_clientes",
                                                        v,
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                </label>
                            </RadioGroup>
                        </div>

                        <div className="rounded-xl bg-muted p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <Ticket className="size-6 text-primary" />
                                <h3 className="text-lg font-semibold text-foreground">
                                    Limite Total de Usos
                                </h3>
                            </div>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Quantidade máxima de vezes que o cupom pode
                                ser resgatado no total
                            </p>
                            <Estepe
                                valor={dados.qtde_usos}
                                onChange={(v) => atualiza("qtde_usos", v)}
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                                Cupom expira ao atingir este número
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between border-t border-border pt-6">
                        <Button type="button" variant="ghost" onClick={irParaAnterior}>
                            <ChevronLeft /> Voltar
                        </Button>
                        <Button type="button" onClick={irParaProxima}>
                            Próximo <ChevronRight />
                        </Button>
                    </div>
                </div>
            )}

            {tab === "disponibilidade" && (
                <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
                    <div className="mb-8">
                        <h2 className="mb-1 text-2xl font-bold text-foreground">
                            Disponibilidade
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Defina quando o cupom estará disponível
                        </p>
                    </div>

                    <div className="space-y-6">
                        <Field
                            className="max-w-xs"
                            data-invalid={!!erroDe(erros, "data_vencimento")}
                        >
                            <FieldLabel htmlFor="data_vencimento">
                                Data de Validade
                            </FieldLabel>
                            <Input
                                id="data_vencimento"
                                type="date"
                                value={dados.data_vencimento}
                                onChange={(e) =>
                                    atualiza(
                                        "data_vencimento",
                                        e.target.value,
                                    )
                                }
                            />
                            {erroDe(erros, "data_vencimento") ? (
                                <FieldError>
                                    {erroDe(erros, "data_vencimento")}
                                </FieldError>
                            ) : (
                                <FieldDescription>
                                    Cupom expira após esta data
                                </FieldDescription>
                            )}
                        </Field>

                        <Field data-invalid={!!erroDe(erros, "dias_disponiveis")}>
                            <FieldLabel>
                                <CalendarDays className="size-4" />
                                Dias da Semana
                            </FieldLabel>
                            <ToggleGroup
                                type="multiple"
                                variant="outline"
                                value={dados.dias_disponiveis.map(String)}
                                onValueChange={(value) =>
                                    atualiza(
                                        "dias_disponiveis",
                                        value.map(Number).sort(),
                                    )
                                }
                                className="flex-wrap"
                            >
                                {DIAS_SEMANA.map((dia) => (
                                    <ToggleGroupItem
                                        key={dia.id}
                                        value={String(dia.id)}
                                        aria-label={dia.nome}
                                    >
                                        {dados.dias_disponiveis.includes(
                                            dia.id,
                                        ) && <Check />}
                                        {dia.abreviacao}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                            {erroDe(erros, "dias_disponiveis") ? (
                                <FieldError>
                                    {erroDe(erros, "dias_disponiveis")}
                                </FieldError>
                            ) : (
                                <FieldDescription>
                                    Selecione os dias em que o cupom pode
                                    ser usado
                                </FieldDescription>
                            )}
                        </Field>

                        <div className="flex items-center justify-between rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
                            <div>
                                <p className="text-sm font-medium">
                                    Exibir cupom no checkout
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    O cliente verá este cupom disponível
                                    durante a finalização do pedido
                                </p>
                            </div>
                            <Switch
                                checked={dados.cupom_visivel}
                                onCheckedChange={(v) =>
                                    atualiza("cupom_visivel", v)
                                }
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between border-t border-border pt-6">
                        <Button type="button" variant="ghost" onClick={irParaAnterior}>
                            <ChevronLeft /> Voltar
                        </Button>
                        <Button
                            type="button"
                            disabled={salvando}
                            onClick={() => aoSalvar(dados)}
                        >
                            {salvando ? (
                                <>
                                    <Spinner /> Salvando...
                                </>
                            ) : (
                                <>
                                    <Check /> {labelBotaoFinal}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
