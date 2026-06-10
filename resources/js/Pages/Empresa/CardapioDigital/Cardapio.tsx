import { MenuItemCard } from "@/components/Empresa/CardapioDigital/MenuItemCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H4 } from "@/components/utils/Heading";
import LayoutCardapio from "@/Layouts/LayoutCardapio";
import { ICardapio } from "@/types/cardapio-digital/cardapio";

interface IProps {
    interacao_id: string;
    tipo_funcionamento: string;
    capa?: string;
    logo?: string;
    nome_fantasia: string;
    categorias: { id: number; nome: string };
    cardapioHoje: ICardapio;
}

export default function Cardapio({
    interacao_id,
    tipo_funcionamento,
    capa,
    logo,
    nome_fantasia,
    categorias,
    cardapioHoje,
}: IProps) {
    const HOJE = new Date().getDay();
    console.log(cardapioHoje);

    return (
        <LayoutCardapio
            recebeInteracaoId={interacao_id}
            recebeTipoFuncionamento={tipo_funcionamento}
        >
            {/* Hero Section */}
            <section className="flex flex-col gap-4">
                {capa ? (
                    <img
                        src={capa}
                        className="h-64 flex justify-center items-center w-full border border-border object-cover rounded-xl"
                        alt={`Capa da loja ${nome_fantasia}`}
                    />
                ) : (
                    <div className="h-64 flex justify-center items-center w-full border border-border rounded-xl">
                        Não possui capa configurada
                    </div>
                )}
                <div className="flex gap-2 items-center">
                    {logo ? (
                        <img
                            src={logo}
                            className="rounded-xl size-20"
                            alt={`Logo da loja ${nome_fantasia}`}
                        />
                    ) : (
                        <div className="rounded-xl size-20 text-wrap border border-border flex justify-center items-center text-center">
                            Sem logo
                        </div>
                    )}
                    <H4>{nome_fantasia}</H4>
                </div>
            </section>
            {/* End Hero Section */}

            <section className="flex flex-col gap-4 my-4">
                {cardapioHoje?.categorias
                    .filter((categoria) =>
                        categoria.dias_funcionamento.map(Number).includes(HOJE),
                    )
                    .map((categoria, idx) => (
                        <Card key={idx} className="w-full">
                            <CardHeader>
                                <CardTitle>{categoria.nome}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {categoria.tipo === "I" &&
                                    (categoria.itens.length ?? 0) > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {categoria.itens.map(
                                                (item, idxItem) => (
                                                    <Button asChild key={idxItem}>
                                                        <MenuItemCard
                                                            item={{
                                                                nome: item.nome,
                                                                preco: item.preco as number,
                                                                classificacoes: item.classificacao,
                                                                desconto: item.desconto,
                                                                descricao: item.descricao ?? undefined,
                                                                imagem: item.imagem ?? undefined,
                                                                peso: item.peso ?? undefined,
                                                                qtde_pessoas: item.qtde_pessoas ?? undefined,
                                                                valor_desconto: item.valor_desconto as number
                                                            }}
                                                        />
                                                    </Button>
                                                ),
                                            )}
                                        </div>
                                    )}
                            </CardContent>
                        </Card>
                    ))}
            </section>
        </LayoutCardapio>
    );
}
