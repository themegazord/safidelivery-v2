import { Scale, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Classificacao } from "@/types/cardapio-digital/cardapio";

export interface MenuItem {
  nome: string;
  descricao?: string;
  imagem?: string;
  classificacoes?: Classificacao;
  peso?: string;
  qtde_pessoas?: number;
  preco: number;
  desconto?: number;
  valor_desconto?: number;
}

const formatBRL = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function MenuItemCard({ item }: { item: MenuItem }) {
  const classificacoes = item.classificacoes
    ? Object.entries(item.classificacoes)
    : [];

  return (
    <Card className="group flex flex-col overflow-hidden border-border/60 bg-card transition-all hover:-translate-y-1 hover:shadow-xl">
      {item.imagem && (
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          <img
            src={item.imagem}
            alt={item.nome}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {item.desconto && (
            <span className="absolute left-3 top-3 rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground shadow-md">
              Oferta
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-semibold leading-tight text-foreground">
          {item.nome}
        </h3>

        {item.descricao && (
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {item.descricao}
          </p>
        )}

        {classificacoes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {classificacoes.map(([chave, c]) => (
              <Badge
                key={chave}
                variant="secondary"
                className="gap-1 font-normal"
              >
                <span aria-hidden>{c.icone}</span>
                {c.label}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
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
              {item.qtde_pessoas <= 1 ? "pessoa" : "pessoas"}
            </span>
          )}
        </div>

        <div className="mt-auto pt-2">
          {!item.desconto ? (
            <p className="text-2xl font-bold text-foreground">
              {formatBRL(item.preco)}
            </p>
          ) : (
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-destructive">
                {formatBRL(item.valor_desconto ?? item.preco)}
              </p>
              <p className="text-sm text-muted-foreground line-through">
                {formatBRL(item.preco)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
