import { Loader, Scale, Users, UtensilsCrossed } from "lucide-react";
import { ComponentPropsWithoutRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ClassificacaoView {
    icone: string;
    label: string;
    cor: string;
}

export interface MenuItem {
    nome: string;
    descricao?: string;
    imagem?: string;
    classificacoes?: string[];
    peso?: string;
    qtde_pessoas?: number;
    preco: number;
    desconto?: number;
    valor_desconto?: number;
}

interface IProps extends ComponentPropsWithoutRef<typeof Card> {
    item: MenuItem;
    isLoading?: boolean;
}

export const CLASSIFICACOES_DISPONIVEIS: Record<string, ClassificacaoView> = {
    vegetariano: { icone: "🥬", label: "Vegetariano", cor: "badge-success" },
    vegano: { icone: "🌱", label: "Vegano", cor: "badge-success" },
    organico: { icone: "🌿", label: "Orgânico", cor: "badge-info" },
    sem_acucar: { icone: "🍬", label: "Sem Açúcar", cor: "badge-warning" },
    zero_lactose: { icone: "🥛", label: "Zero Lactose", cor: "badge-info" },
    bebida_gelada: { icone: "🧊", label: "Gelada", cor: "badge-primary" },
    bebida_alcoolica: { icone: "🍷", label: "Alcoólica", cor: "badge-error" },
    bebida_natural: { icone: "🥤", label: "Natural", cor: "badge-success" },
    bebida_zero_lactose: {
        icone: "🥛",
        label: "Zero Lactose",
        cor: "badge-info",
    },
    bebida_diet_zero: {
        icone: "☑️",
        label: "Diet/Zero",
        cor: "badge-warning",
    },
};

export const CORES_BADGE: Record<string, string> = {
    "badge-success":
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    "badge-info":
        "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    "badge-warning":
        "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    "badge-error":
        "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    "badge-primary": "bg-primary/15 text-primary",
};

const formatBRL = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export function MenuItemCard({ item, className, onClick, isLoading }: IProps) {
    const classificacoes = item.classificacoes ?? [];

    return (
        <Card
            onClick={onClick}
            className={cn(
                "border-border/60 bg-card cursor-pointer overflow-hidden p-4 transition-all hover:shadow-lg",
                className,
            )}
        >
            {!isLoading ? (
                <div className="flex gap-4 sm:gap-6">
                    <div className="bg-muted relative size-32 shrink-0 overflow-hidden rounded-lg sm:h-40 sm:w-40">
                        {item.imagem ? (
                            <img
                                src={item.imagem}
                                alt={item.nome}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <UtensilsCrossed className="text-muted-foreground h-10 w-10" />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-1 flex-col items-center text-center">
                        <h3 className="text-foreground text-base font-bold tracking-wide uppercase sm:text-lg">
                            {item.nome}
                        </h3>

                        {item.descricao && (
                            <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                                {item.descricao}
                            </p>
                        )}

                        {classificacoes.length > 0 && (
                            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                                {classificacoes.map((classificacaoKey) => {
                                    const classificacao =
                                        CLASSIFICACOES_DISPONIVEIS[
                                            classificacaoKey
                                        ];

                                    if (!classificacao) return null;

                                    return (
                                        <Badge
                                            key={classificacaoKey}
                                            variant="secondary"
                                            className={cn(
                                                "gap-1 border-transparent font-normal",
                                                CORES_BADGE[classificacao.cor],
                                            )}
                                        >
                                            <span aria-hidden>
                                                {classificacao.icone}
                                            </span>
                                            <span>{classificacao.label}</span>
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}

                        {(item.peso || item.qtde_pessoas) && (
                            <div className="text-muted-foreground mt-2 flex flex-wrap justify-center gap-3 text-xs">
                                {item.peso && (
                                    <span className="inline-flex items-center gap-1">
                                        <Scale className="h-3.5 w-3.5" />
                                        {item.peso}g
                                    </span>
                                )}

                                {item.qtde_pessoas && (
                                    <span className="inline-flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" />
                                        Serve {item.qtde_pessoas}{" "}
                                        {item.qtde_pessoas <= 1
                                            ? "pessoa"
                                            : "pessoas"}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="mt-auto pt-3">
                            {!item.desconto ? (
                                <p className="text-primary text-xl font-bold sm:text-2xl">
                                    {formatBRL(item.preco)}
                                </p>
                            ) : (
                                <div className="flex items-baseline justify-center gap-2">
                                    <p className="text-primary text-xl font-bold sm:text-2xl">
                                        {formatBRL(
                                            item.valor_desconto ?? item.preco,
                                        )}
                                    </p>
                                    <p className="text-muted-foreground text-sm line-through">
                                        {formatBRL(item.preco)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex min-h-40 items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin" />
                </div>
            )}
        </Card>
    );
}
