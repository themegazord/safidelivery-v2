import { MenuItemCard } from "@/components/Empresa/CardapioDigital/MenuItemCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DragScrollContainer } from "@/components/Empresa/CardapioDigital/DragScroll";
import { H4 } from "@/components/utils/Heading";
import LayoutCardapio from "@/Layouts/LayoutCardapio";
import {
    ICardapio,
    ICategoria,
    ITamanhoPizza,
} from "@/types/cardapio-digital/cardapio";
import axios from "axios";
import { Search } from "lucide-react";
import { ReactNode, useContext, useEffect, useState } from "react";
import { PedidoModalContext } from "@/contexts/CardapioDigital/PedidoModalContext";

interface IProps {
    interacao_id: string;
    tipo_funcionamento: string;
    capa?: string;
    logo?: string;
    nome_fantasia: string;
    categorias: { id: number; nome: string }[];
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
    const [pesquisa, setPesquisa] = useState<string>("");
    const [filtrado, setFiltrado] = useState<ICategoria[]>(
        cardapioHoje?.categorias ?? [],
    );
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [loadingItemId, setLoadingItemId] = useState<number | null>(null);

    const { abrirItemNovo } = useContext(PedidoModalContext);

    function getItensAtivosPizza(tamanho: ITamanhoPizza) {
        return tamanho.precos_por_tamanho.filter((ppt) => {
            return (
                ppt.status === 1 &&
                ppt.item !== null &&
                ppt.dias_funcionamento.map(Number).includes(HOJE)
            );
        });
    }

    function getMenorValorTamanho(tamanho: ITamanhoPizza) {
        const itensAtivos = getItensAtivosPizza(tamanho);

        return itensAtivos.sort((a, b) => Number(a.preco) - Number(b.preco))[0]
            ?.preco;
    }

    useEffect(() => {
        const texto = pesquisa.toLowerCase().trim();

        const categoriasFiltradas = (cardapioHoje?.categorias ?? [])
            .map((categoria) => {
                const itens =
                    categoria.itens?.filter((item) =>
                        item.nome.toLowerCase().includes(texto),
                    ) ?? [];

                const combos =
                    categoria.combos?.filter((combo) =>
                        combo.nome.toLowerCase().includes(texto),
                    ) ?? [];

                const tamanhos =
                    categoria.tamanhos?.filter((tamanho) => {
                        const tamanhoBate = tamanho.nome
                            .toLowerCase()
                            .includes(texto);

                        const precosFiltrados =
                            tamanho.precos_por_tamanho?.filter((preco) =>
                                preco.item?.nome.toLowerCase().includes(texto),
                            ) ?? [];

                        return tamanhoBate || precosFiltrados.length > 0;
                    }) ?? [];

                return {
                    ...categoria,
                    itens,
                    combos,
                    tamanhos,
                };
            })
            .filter((categoria) => {
                const categoriaBate = categoria.nome
                    .toLowerCase()
                    .includes(texto);

                return (
                    categoriaBate ||
                    categoria.itens.length > 0 ||
                    categoria.combos.length > 0 ||
                    categoria.tamanhos.length > 0
                );
            });

        setFiltrado(categoriasFiltradas);
    }, [cardapioHoje, pesquisa]);
    
    async function buscaItemPedido(id: number) {
        try {
            setLoadingItemId(id);

            const { data } = await axios.post(
                route("aplicacao.empresa.cardapio-digital.item-pedido", {
                    interacao_id: interacao_id,
                    tipo_funcionamento: tipo_funcionamento,
                }),
                { id },
            );

            abrirItemNovo(data.item, "item");
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingItemId(null);
        }
    }

    async function buscaComboPedido(id: number) {
        try {
            setLoadingItemId(id);

            const { data } = await axios.post(
                route("aplicacao.empresa.cardapio-digital.item-pedido-combo", {
                    interacao_id: interacao_id,
                    tipo_funcionamento: tipo_funcionamento,
                }),
                { combo_id: id },
            );
            abrirItemNovo(data, "combo");
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingItemId(null);
        }
    }

    async function buscaPizzaPedido(
        categoria_tamanho_id: number,
        idx: number,
        qtdeSabor: number,
        menorValorTamanho: number,
    ) {
        try {
            setLoadingItemId(categoria_tamanho_id + idx);

            const { data } = await axios.post(
                route("aplicacao.empresa.cardapio-digital.item-pedido-pizza", {
                    interacao_id: interacao_id,
                    tipo_funcionamento: tipo_funcionamento,
                }),
                {
                    tamanho_id: categoria_tamanho_id,
                    qtdeSabor: qtdeSabor,
                    menorValorTamanho: menorValorTamanho,
                },
            );

            abrirItemNovo(data.tamanho, "pizza");
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingItemId(null);
        }
    }

    return (
        <>
            {/* Hero Section */}
            <section className="flex flex-col gap-4">
                {capa ? (
                    <img
                        src={capa}
                        className="border-border flex h-64 w-full items-center justify-center rounded-xl border object-cover"
                        alt={`Capa da loja ${nome_fantasia}`}
                    />
                ) : (
                    <div className="border-border flex h-64 w-full items-center justify-center rounded-xl border">
                        Não possui capa configurada
                    </div>
                )}
                <div className="flex items-center gap-2">
                    {logo ? (
                        <img
                            src={logo}
                            className="size-20 rounded-xl"
                            alt={`Logo da loja ${nome_fantasia}`}
                        />
                    ) : (
                        <div className="border-border flex size-20 items-center justify-center rounded-xl border text-center text-wrap">
                            Sem logo
                        </div>
                    )}
                    <H4>{nome_fantasia}</H4>
                </div>
            </section>
            {/* End Hero Section */}

            <div className="bg-background border-border sticky top-17 z-10 flex flex-col gap-3 border-b pt-4 pb-3">
                <div className="relative">
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                        className="pl-9"
                        placeholder="Pesquisar itens..."
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                    />
                </div>
                <DragScrollContainer
                    cards={categorias}
                    activeCategory={activeCategory}
                    onSelect={setActiveCategory}
                />
            </div>

            <section className="mt-4 flex flex-col gap-4">
                {filtrado
                    .filter((categoria) =>
                        categoria.dias_funcionamento.map(Number).includes(HOJE),
                    )
                    .map((categoria, idx) => (
                        <Card
                            key={idx}
                            id={`categoria-${categoria.id}`}
                            className="w-full"
                        >
                            <CardHeader>
                                <CardTitle>{categoria.nome}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {categoria.tipo === "I" &&
                                        (categoria.itens.length ?? 0) > 0 && (
                                            <>
                                                {categoria.itens
                                                    .filter((item) =>
                                                        item.dias_funcionamento
                                                            .map(Number)
                                                            .includes(HOJE),
                                                    )
                                                    .map((item, idxItem) => (
                                                        <MenuItemCard
                                                            key={idxItem}
                                                            onClick={() =>
                                                                buscaItemPedido(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="cursor-pointer"
                                                            isLoading={
                                                                loadingItemId ===
                                                                item.id
                                                            }
                                                            item={{
                                                                nome: item.nome,
                                                                preco: Number(
                                                                    item.preco,
                                                                ),
                                                                classificacoes:
                                                                    item.classificacao,
                                                                desconto:
                                                                    item.desconto,
                                                                descricao:
                                                                    item.descricao ??
                                                                    undefined,
                                                                imagem:
                                                                    item.imagem ??
                                                                    undefined,
                                                                peso:
                                                                    item.peso ??
                                                                    undefined,
                                                                qtde_pessoas:
                                                                    item.qtde_pessoas ??
                                                                    undefined,
                                                                valor_desconto:
                                                                    item.valor_desconto
                                                                        ? Number(
                                                                              item.valor_desconto,
                                                                          )
                                                                        : undefined,
                                                            }}
                                                        />
                                                    ))}
                                            </>
                                        )}

                                    {categoria.tipo === "I" &&
                                        (categoria.combos.length ?? 0) > 0 && (
                                            <>
                                                {categoria.combos
                                                    .filter((item) =>
                                                        item.dias_funcionamento
                                                            .map(Number)
                                                            .includes(HOJE),
                                                    )
                                                    .map((combo, idxcombo) => (
                                                        <MenuItemCard
                                                            onClick={() =>
                                                                buscaComboPedido(
                                                                    combo.id,
                                                                )
                                                            }
                                                            className="cursor-pointer"
                                                            key={idxcombo}
                                                            item={{
                                                                nome: combo.nome,
                                                                preco:
                                                                    Number(
                                                                        combo.preco,
                                                                    ) ??
                                                                    undefined,
                                                                classificacoes:
                                                                    [],
                                                                desconto: 0,
                                                                descricao:
                                                                    combo.descricao ??
                                                                    undefined,
                                                                imagem:
                                                                    combo.imagem ??
                                                                    undefined,
                                                                peso: undefined,
                                                                qtde_pessoas:
                                                                    undefined,
                                                                valor_desconto:
                                                                    undefined,
                                                            }}
                                                        />
                                                    ))}
                                            </>
                                        )}

                                    {categoria.tipo === "P" &&
                                        categoria.tamanhos.map(
                                            (tamanho, tamanhoIdx) => {
                                                const itensAtivos =
                                                    getItensAtivosPizza(
                                                        tamanho,
                                                    );
                                                const menorValorTamanho =
                                                    getMenorValorTamanho(
                                                        tamanho,
                                                    );

                                                if (
                                                    itensAtivos.length === 0 ||
                                                    !menorValorTamanho
                                                ) {
                                                    return null;
                                                }

                                                const primeiroItem =
                                                    itensAtivos[0]?.item;

                                                return (
                                                    <div key={tamanhoIdx}>
                                                        {tamanho.qtde_sabores.map(
                                                            (
                                                                qtde,
                                                                idxSabores,
                                                            ) => (
                                                                <MenuItemCard
                                                                    onClick={() =>
                                                                        buscaPizzaPedido(
                                                                            tamanho.id,
                                                                            tamanhoIdx,
                                                                            qtde,
                                                                            menorValorTamanho,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer"
                                                                    key={
                                                                        idxSabores
                                                                    }
                                                                    item={{
                                                                        nome: `${tamanho.nome} ${
                                                                            qtde >
                                                                            1
                                                                                ? `${qtde} SABORES `
                                                                                : ""
                                                                        } (${tamanho.qtde_pedacos} PEDAÇOS)`,
                                                                        descricao:
                                                                            undefined,
                                                                        imagem:
                                                                            primeiroItem?.imagem ??
                                                                            undefined,
                                                                        preco: Number(
                                                                            menorValorTamanho,
                                                                        ),
                                                                    }}
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                );
                                            },
                                        )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
            </section>
        </>
    );
}

Cardapio.layout = (page: ReactNode) => <LayoutCardapio>{page}</LayoutCardapio>;
