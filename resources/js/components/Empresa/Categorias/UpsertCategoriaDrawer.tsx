import { useEffect, useState } from "react";
import {
    Drawer,
    DrawerContent,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { Pizza, Plus, Trash2, UtensilsCrossed, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type TipoCategoria = "I" | "P" | null;

export interface DiaSemana {
    id: number;
    nome: string;
}

export interface OpcaoQtdSabores {
    id: number;
    nome: number;
}

export interface TamanhoPizza {
    external_id: string;
    nome: string;
    qtde_pedacos: string;
    qtde_sabores: number[];
}

export interface MassaPizza {
    nome: string;
    preco: string;
    external_id: string;
}

export interface BordaPizza {
    nome: string;
    preco: string;
    external_id: string;
}

export interface CategoriaFormData {
    tipo: TipoCategoria;
    nome: string;
    dias_funcionamento: number[];
    tamanhos: TamanhoPizza[];
    massas: MassaPizza[];
    bordas: BordaPizza[];
}

interface UpsertCategoriaDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Dados existentes, para edição. Omitido/null = cadastro novo. */
    categoria?: Partial<CategoriaFormData> | null;
    diasSemana: DiaSemana[];
    opcoesQtdSabores: OpcaoQtdSabores[];
    onSubmit: (categoria: CategoriaFormData, categoria_id?: number) => void;
}

type TabPizza = "detalhes" | "tamanhos" | "massas" | "bordas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function criarTamanhoVazio(): TamanhoPizza {
    return { external_id: "", nome: "", qtde_pedacos: "", qtde_sabores: [] };
}

function criarMassaVazia(): MassaPizza {
    return { nome: "", preco: "", external_id: "" };
}

function criarBordaVazia(): BordaPizza {
    return { nome: "", preco: "", external_id: "" };
}

function criarCategoriaInicial(
    base?: Partial<CategoriaFormData> | null,
): CategoriaFormData {
    return {
        tipo: base?.tipo ?? null,
        nome: base?.nome ?? "",
        dias_funcionamento: base?.dias_funcionamento ?? [],
        tamanhos: base?.tamanhos?.length ? base.tamanhos : [criarTamanhoVazio()],
        massas: base?.massas?.length ? base.massas : [criarMassaVazia()],
        bordas: base?.bordas?.length ? base.bordas : [criarBordaVazia()],
    };
}

// ---------------------------------------------------------------------------
// Seleção do tipo de categoria
// ---------------------------------------------------------------------------

function OpcaoTipoCategoria({
    icon,
    titulo,
    descricao,
    onClick,
}: {
    icon: React.ReactNode;
    titulo: string;
    descricao: string;
    onClick: () => void;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            onClick={onClick}
            className="flex h-24 w-full flex-nowrap items-center justify-start gap-4 p-4 text-left hover:border-primary hover:bg-primary/5"
        >
            <span className="shrink-0 text-muted-foreground">{icon}</span>
            <div className="flex flex-col items-start gap-1 whitespace-normal">
                <h3 className="text-base font-bold sm:text-lg">{titulo}</h3>
                <p className="w-full text-sm text-muted-foreground sm:text-base">
                    {descricao}
                </p>
            </div>
        </Button>
    );
}

function ModeloSelecionado({
    icon,
    titulo,
    onAlterar,
}: {
    icon: React.ReactNode;
    titulo: string;
    onAlterar: () => void;
}) {
    return (
        <div className="mb-8 flex h-20 flex-wrap items-center justify-between rounded-md border border-purple-400 px-4">
            <div className="flex items-center gap-4 sm:gap-8">
                {icon}
                <h3 className="text-base font-bold sm:text-lg">{titulo}</h3>
            </div>
            <button
                type="button"
                onClick={onAlterar}
                className="text-sm text-primary underline-offset-4 hover:underline sm:text-base"
            >
                Alterar
            </button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Dias de funcionamento (multi-toggle simples)
// ---------------------------------------------------------------------------

function SeletorDiasFuncionamento({
    diasSemana,
    selecionados,
    onChange,
}: {
    diasSemana: DiaSemana[];
    selecionados: number[];
    onChange: (dias: number[]) => void;
}) {
    const toggleDia = (id: number) => {
        onChange(
            selecionados.includes(id)
                ? selecionados.filter((d) => d !== id)
                : [...selecionados, id],
        );
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <Label>Dias de funcionamento</Label>
                <div className="flex gap-3 text-xs">
                    <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => onChange(diasSemana.map((d) => d.id))}
                    >
                        Selecionar todos
                    </button>
                    <button
                        type="button"
                        className="text-muted-foreground hover:underline"
                        onClick={() => onChange([])}
                    >
                        Remover todos
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {diasSemana.map((dia) => {
                    const ativo = selecionados.includes(dia.id);
                    return (
                        <Button
                            key={dia.id}
                            type="button"
                            size="sm"
                            variant={ativo ? "default" : "outline"}
                            onClick={() => toggleDia(dia.id)}
                        >
                            {dia.nome}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Linhas de tamanho / massa / borda
// ---------------------------------------------------------------------------

function LinhaTamanho({
    tamanho,
    opcoesQtdSabores,
    podeRemover,
    onChange,
    onRemover,
}: {
    tamanho: TamanhoPizza;
    opcoesQtdSabores: OpcaoQtdSabores[];
    podeRemover: boolean;
    onChange: (tamanho: TamanhoPizza) => void;
    onRemover: () => void;
}) {
    const qtdeSaboresAnchor = useComboboxAnchor();

    return (
        <div className="grid grid-cols-1 items-end gap-4 sm:flex">
            <div className="flex-1 space-y-1">
                <Label>Cód. PDV</Label>
                <Input
                    value={tamanho.external_id}
                    onChange={(e) =>
                        onChange({ ...tamanho, external_id: e.target.value })
                    }
                />
            </div>
            <div className="flex-1 space-y-1">
                <Label>Nome</Label>
                <Input
                    value={tamanho.nome}
                    onChange={(e) => onChange({ ...tamanho, nome: e.target.value })}
                />
            </div>
            <div className="flex-1 space-y-1">
                <Label>Qtde. Pedaços</Label>
                <Input
                    type="number"
                    value={tamanho.qtde_pedacos}
                    onChange={(e) =>
                        onChange({ ...tamanho, qtde_pedacos: e.target.value })
                    }
                />
            </div>
            <div className="flex-1 space-y-1">
                <Label>Qtde. Sabores</Label>
                <Combobox
                    items={opcoesQtdSabores}
                    multiple
                    autoHighlight
                    itemToStringValue={(opcao: OpcaoQtdSabores) => String(opcao.nome)}
                    value={opcoesQtdSabores.filter((opcao) =>
                        tamanho.qtde_sabores.includes(opcao.id),
                    )}
                    onValueChange={(opcoes: OpcaoQtdSabores[]) =>
                        onChange({
                            ...tamanho,
                            qtde_sabores: opcoes.map((opcao) => opcao.id),
                        })
                    }
                >
                    <ComboboxChips ref={qtdeSaboresAnchor}>
                        <ComboboxValue>
                            {opcoesQtdSabores
                                .filter((opcao) =>
                                    tamanho.qtde_sabores.includes(opcao.id),
                                )
                                .map((opcao) => (
                                    <ComboboxChip key={opcao.id}>
                                        {opcao.nome}
                                    </ComboboxChip>
                                ))}
                            <ComboboxChipsInput placeholder="Selecione a quantidade..." />
                        </ComboboxValue>
                    </ComboboxChips>
                    <ComboboxContent anchor={qtdeSaboresAnchor}>
                        <ComboboxEmpty>Nenhuma opção encontrada</ComboboxEmpty>
                        <ComboboxList>
                            {(opcao: OpcaoQtdSabores) => (
                                <ComboboxItem key={opcao.id} value={opcao}>
                                    {opcao.nome}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </div>
            {podeRemover && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={onRemover}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}

function LinhaPrecoNomeCodigo({
    nome,
    preco,
    externalId,
    podeRemover,
    onChangeNome,
    onChangePreco,
    onChangeExternalId,
    onRemover,
}: {
    nome: string;
    preco: string;
    externalId: string;
    podeRemover: boolean;
    onChangeNome: (v: string) => void;
    onChangePreco: (v: string) => void;
    onChangeExternalId: (v: string) => void;
    onRemover: () => void;
}) {
    return (
        <div className="grid grid-cols-1 items-end gap-4 sm:flex">
            <div className="flex-1 space-y-1">
                <Label>Nome</Label>
                <Input value={nome} onChange={(e) => onChangeNome(e.target.value)} />
            </div>
            <div className="flex-1 space-y-1">
                <Label>Preço</Label>
                <div className="flex items-center rounded-md border border-input">
                    <span className="pl-3 text-sm text-muted-foreground">R$</span>
                    <Input
                        type="number"
                        step="0.01"
                        className="border-0 focus-visible:ring-0"
                        value={preco}
                        onChange={(e) => onChangePreco(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 space-y-1">
                <Label>Código PDV</Label>
                <Input
                    value={externalId}
                    onChange={(e) => onChangeExternalId(e.target.value)}
                />
            </div>
            {podeRemover && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={onRemover}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function UpsertCategoriaDrawer({
    open,
    onOpenChange,
    categoria: categoriaProp,
    diasSemana,
    opcoesQtdSabores,
    onSubmit,
}: UpsertCategoriaDrawerProps) {
    const [categoria, setCategoria] = useState<CategoriaFormData>(() =>
        criarCategoriaInicial(categoriaProp),
    );
    const [tabSelecionada, setTabSelecionada] = useState<TabPizza>("detalhes");

    // Recarrega/reseta o estado toda vez que o drawer é aberto
    useEffect(() => {
        if (open) {
            setCategoria(criarCategoriaInicial(categoriaProp));
            setTabSelecionada("detalhes");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const fechar = () => onOpenChange(false);

    const nomeExibicao =
        categoria.nome.trim() === "" ? "Nova categoria" : categoria.nome;

    return (
        <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
            <DrawerContent className="w-full p-6 lg:w-[55vw]">
                <div className="flex flex-row-reverse">
                    <Button type="button" variant="ghost" size="icon" onClick={fechar}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit(categoria);
                    }}
                >
                    {/* Etapa 0: seleção do tipo */}
                    {categoria.tipo === null && (
                        <div className="mt-4 flex flex-col gap-4">
                            <h1 className="text-2xl font-bold sm:text-3xl">
                                Nova categoria
                            </h1>
                            <h3 className="text-lg text-muted-foreground sm:text-xl">
                                Selecione o modelo de categoria para dividir o seu cardápio
                            </h3>

                            <OpcaoTipoCategoria
                                icon={<UtensilsCrossed className="size-8" />}
                                titulo="Itens principais"
                                descricao="Comidas, lanches, sobremesas e etc."
                                onClick={() =>
                                    setCategoria((prev) => ({ ...prev, tipo: "I" }))
                                }
                            />
                            <OpcaoTipoCategoria
                                icon={<Pizza className="size-8" />}
                                titulo="Pizza"
                                descricao="Defina o tamanho, tipos de massa, bordas e sabores"
                                onClick={() =>
                                    setCategoria((prev) => ({ ...prev, tipo: "P" }))
                                }
                            />
                        </div>
                    )}

                    {/* Etapa: itens principais */}
                    {categoria.tipo === "I" && (
                        <div className="mt-4 flex flex-col gap-4">
                            <h1 className="text-3xl font-bold">{nomeExibicao}</h1>
                            <h3 className="text-xl text-muted-foreground">
                                Detalhes da categoria
                            </h3>

                            <h1 className="text-3xl">Modelo</h1>
                            <ModeloSelecionado
                                icon={<UtensilsCrossed className="size-6" />}
                                titulo="Itens principais"
                                onAlterar={() =>
                                    setCategoria((prev) => ({ ...prev, tipo: null }))
                                }
                            />

                            <div className="space-y-1">
                                <Label htmlFor="nome-categoria" className="text-2xl">
                                    Nome da categoria
                                </Label>
                                <Input
                                    id="nome-categoria"
                                    placeholder="Ex: Marmitas, lanches, sorvetes..."
                                    value={categoria.nome}
                                    onChange={(e) =>
                                        setCategoria((prev) => ({
                                            ...prev,
                                            nome: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <SeletorDiasFuncionamento
                                diasSemana={diasSemana}
                                selecionados={categoria.dias_funcionamento}
                                onChange={(dias) =>
                                    setCategoria((prev) => ({
                                        ...prev,
                                        dias_funcionamento: dias,
                                    }))
                                }
                            />

                            <div className="flex flex-row-reverse gap-4">
                                <Button type="submit">Cadastrar</Button>
                                <Button type="button" variant="ghost" onClick={fechar}>
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Etapa: pizza (wizard em abas) */}
                    {categoria.tipo === "P" && (
                        <div className="mt-4 flex flex-col gap-4">
                            <h1 className="text-3xl font-bold">{nomeExibicao}</h1>
                            <h3 className="text-xl text-muted-foreground">
                                Detalhes da categoria
                            </h3>

                            <Tabs
                                value={tabSelecionada}
                                onValueChange={(v) => setTabSelecionada(v as TabPizza)}
                            >
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                                    <TabsTrigger value="tamanhos">Tamanhos</TabsTrigger>
                                    <TabsTrigger value="massas">Massas</TabsTrigger>
                                    <TabsTrigger value="bordas">Bordas</TabsTrigger>
                                </TabsList>

                                {/* Detalhes */}
                                <TabsContent
                                    value="detalhes"
                                    className={cn(
                                        "flex h-auto flex-col gap-4 overflow-y-auto sm:h-[74vh]",
                                    )}
                                >
                                    <ModeloSelecionado
                                        icon={<Pizza className="size-6" />}
                                        titulo="Pizza"
                                        onAlterar={() =>
                                            setCategoria((prev) => ({ ...prev, tipo: null }))
                                        }
                                    />

                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="nome-categoria-pizza"
                                            className="text-lg sm:text-2xl"
                                        >
                                            Nome da categoria
                                        </Label>
                                        <Input
                                            id="nome-categoria-pizza"
                                            placeholder="Ex: Marmitas, lanches, sorvetes..."
                                            value={categoria.nome}
                                            onChange={(e) =>
                                                setCategoria((prev) => ({
                                                    ...prev,
                                                    nome: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <SeletorDiasFuncionamento
                                        diasSemana={diasSemana}
                                        selecionados={categoria.dias_funcionamento}
                                        onChange={(dias) =>
                                            setCategoria((prev) => ({
                                                ...prev,
                                                dias_funcionamento: dias,
                                            }))
                                        }
                                    />

                                    <div className="flex flex-col-reverse gap-4 sm:flex-row-reverse">
                                        <Button
                                            type="button"
                                            onClick={() => setTabSelecionada("tamanhos")}
                                        >
                                            Próximo
                                        </Button>
                                        <Button type="button" variant="ghost" onClick={fechar}>
                                            Cancelar
                                        </Button>
                                    </div>
                                </TabsContent>

                                {/* Tamanhos */}
                                <TabsContent
                                    value="tamanhos"
                                    className="flex h-auto flex-col gap-4 overflow-y-auto sm:h-[74vh]"
                                >
                                    <h1 className="mb-4 text-2xl sm:text-3xl">Tamanhos</h1>
                                    <p className="mb-4 text-base text-muted-foreground sm:text-lg">
                                        Indique aqui os tamanhos que suas pizzas são
                                        produzidas...
                                    </p>

                                    <div className="flex flex-col gap-4">
                                        {categoria.tamanhos.map((tamanhos, idx) => (
                                            <LinhaTamanho
                                                key={idx}
                                                tamanho={tamanhos}
                                                opcoesQtdSabores={opcoesQtdSabores}
                                                podeRemover={categoria.tamanhos.length > 1}
                                                onChange={(novoTamanho) =>
                                                    setCategoria((prev) => ({
                                                        ...prev,
                                                        tamanhos: prev.tamanhos.map((t, i) =>
                                                            i === idx ? novoTamanho : t,
                                                        ),
                                                    }))
                                                }
                                                onRemover={() =>
                                                    setCategoria((prev) => ({
                                                        ...prev,
                                                        tamanhos: prev.tamanhos.filter(
                                                            (_, i) => i !== idx,
                                                        ),
                                                    }))
                                                }
                                            />
                                        ))}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full sm:w-1/2"
                                            onClick={() =>
                                                setCategoria((prev) => ({
                                                    ...prev,
                                                    tamanhos: [
                                                        ...prev.tamanhos,
                                                        criarTamanhoVazio(),
                                                    ],
                                                }))
                                            }
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Novo tamanho
                                        </Button>

                                        <div className="flex flex-col-reverse gap-4 sm:flex-row-reverse">
                                            <Button
                                                type="button"
                                                onClick={() => setTabSelecionada("massas")}
                                            >
                                                Próximo
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={fechar}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Massas */}
                                <TabsContent
                                    value="massas"
                                    className="flex h-auto flex-col gap-4 overflow-y-auto sm:h-[74vh]"
                                >
                                    <h1 className="mb-4 text-2xl sm:text-3xl">Massas</h1>
                                    <p className="mb-4 text-base text-muted-foreground sm:text-lg">
                                        Adicione os tipos de massa disponíveis...
                                    </p>

                                    <div className="flex flex-col gap-4">
                                        {categoria.massas.map((massa, idx) => (
                                            <LinhaPrecoNomeCodigo
                                                key={idx}
                                                nome={massa.nome}
                                                preco={massa.preco}
                                                externalId={massa.external_id}
                                                podeRemover={categoria.massas.length > 1}
                                                onChangeNome={(v) =>
                                                    setCategoria((prev) => ({
                                                        ...prev,
                                                        massas: prev.massas.map((m, i) =>
                                                            i === idx ? { ...m, nome: v } : m,
                                                        ),
                                                    }))
                                                }
                                                onChangePreco={(v) =>
                                                    setCategoria((prev) => ({
                                                        ...prev,
                                                        massas: prev.massas.map((m, i) =>
                                                            i === idx ? { ...m, preco: v } : m,
                                                        ),
                                                    }))
                                                }
                                                onChangeExternalId={(v) =>
                                                    setCategoria((prev) => ({
                                                        ...prev,
                                                        massas: prev.massas.map((m, i) =>
                                                            i === idx
                                                                ? { ...m, external_id: v }
                                                                : m,
                                                        ),
                                                    }))
                                                }
                                                onRemover={() =>
                                                    setCategoria((prev) => ({
                                                        ...prev,
                                                        massas: prev.massas.filter(
                                                            (_, i) => i !== idx,
                                                        ),
                                                    }))
                                                }
                                            />
                                        ))}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full sm:w-1/3"
                                            onClick={() =>
                                                setCategoria((prev) => ({
                                                    ...prev,
                                                    massas: [...prev.massas, criarMassaVazia()],
                                                }))
                                            }
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Nova massa
                                        </Button>

                                        <div className="flex flex-col-reverse gap-4 sm:flex-row-reverse">
                                            <Button
                                                type="button"
                                                onClick={() => setTabSelecionada("bordas")}
                                            >
                                                Próximo
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={fechar}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Bordas */}
                                <TabsContent
                                    value="bordas"
                                    className="flex h-auto flex-col gap-4 overflow-y-auto sm:h-[74vh]"
                                >
                                    <h1 className="mb-4 text-2xl sm:text-3xl">Bordas</h1>
                                    <p className="mb-4 text-base text-muted-foreground sm:text-lg">
                                        Adicione os tipos de borda disponíveis...
                                    </p>

                                    <div className="flex flex-col gap-4">
                                        {categoria.bordas.map((bordas, idx) => (
                                            <LinhaPrecoNomeCodigo
                                                key={idx}
                                                nome={bordas.nome}
                                                preco={bordas.preco}
                                                externalId={bordas.external_id}
                                                podeRemover={categoria.bordas.length > 1}
                                                onChangeNome={(v) =>
                                                    setCategoria((prev) => ({
                                                        ...prev,
                                                        bordas: prev.bordas.map((b, i) =>
                                                            i === idx ? { ...b, nome: v } : b,
                                                        ),
                                                    }))
                                                }
                                                onChangePreco={(v) =>
                                                    setCategoria((prev) => ({
                                                        ...prev,
                                                        bordas: prev.bordas.map((b, i) =>
                                                            i === idx ? { ...b, preco: v } : b,
                                                        ),
                                                    }))
                                                }
                                                onChangeExternalId={(v) =>
                                                    setCategoria((prev) => ({
                                                        ...prev,
                                                        bordas: prev.bordas.map((b, i) =>
                                                            i === idx
                                                                ? { ...b, external_id: v }
                                                                : b,
                                                        ),
                                                    }))
                                                }
                                                onRemover={() =>
                                                    setCategoria((prev) => ({
                                                        ...prev,
                                                        bordas: prev.bordas.filter(
                                                            (_, i) => i !== idx,
                                                        ),
                                                    }))
                                                }
                                            />
                                        ))}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full sm:w-1/3"
                                            onClick={() =>
                                                setCategoria((prev) => ({
                                                    ...prev,
                                                    bordas: [...prev.bordas, criarBordaVazia()],
                                                }))
                                            }
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Nova borda
                                        </Button>

                                        <div className="flex flex-col-reverse gap-4 sm:flex-row-reverse">
                                            <Button type="submit">Finalizar</Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={fechar}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </form>
            </DrawerContent>
        </Drawer>
    );
}

export default UpsertCategoriaDrawer;
