import { MenuItemCard } from "@/components/Empresa/CardapioDigital/MenuItemCard";
import { Button } from "@/components/ui/button";
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
import { useEffect, useState } from "react";
import ModalItens from "@/components/Empresa/CardapioDigital/ModalItens";
import { IItemPedido } from "@/types/cardapio-digital/item-pedido";

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
    const [openModalPedido, setOpenModalPedido] = useState<boolean>(false);

    const [itemModal, setItemModal] = useState<IItemPedido>();

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

    function adicionaQtdeItemSelecionado(alvo: 'item' | 'complemento', grupo_idx?: number, complemento_idx?: number): void {
        setItemModal(prev => {
            if (!prev) return prev

            if (alvo === 'item') {
                return { ...prev, quantidade: Math.max(1, prev.quantidade + 1) }
            }

            const grupos = prev.grupo_complemento.map((g, gi) => {
                if (gi !== grupo_idx) return g

                const novosComplementos = g.complementos.map((c, ci) => ci === complemento_idx ? { ...c, quantidade: Math.max(0, c.quantidade + 1) } : c)

                const novoTotal = novosComplementos.reduce((acc, c) => acc + c.quantidade, 0)

                return {
                    ...g,
                    complementos: novosComplementos,
                    bloqueado: novoTotal >= g.qtd_maxima
                }
            })

            return { ...prev, grupo_complemento: grupos }
        })
    }

    function diminuiQtdeItemSelecionado(alvo: 'item' | 'complemento', grupo_idx?: number, complemento_idx?: number): void {
        setItemModal(prev => {
            if (!prev) return prev

            if (alvo === 'item') {
                return { ...prev, quantidade: Math.max(1, prev.quantidade - 1) }
            }

            const grupos = prev.grupo_complemento.map((g, gi) => {
                if (gi !== grupo_idx) return g

                const novosComplementos = g.complementos.map((c, ci) => ci === complemento_idx ? { ...c, quantidade: Math.max(0, c.quantidade - 1) } : c)

                const novoTotal = novosComplementos.reduce((acc, c) => acc + c.quantidade, 0)

                return {
                    ...g,
                    complementos: novosComplementos,
                    bloqueado: false
                }
            })

            return { ...prev, grupo_complemento: grupos }
        })
    }

    function adicionaObservacao(observacao: string): void {
        setItemModal(prev => {
            if (!prev) return prev
            return { ...prev, observacao: observacao }
        })
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

            setItemModal(data.item);
            setOpenModalPedido(true)
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingItemId(null);
        }
    }

    function buscaComboPedido(id: number) {
        console.log(id);
    }

    function buscaPizzaPedido(
        categoria_tamanho_id: number,
        qtd_sabor: number,
        preco_inicial: number,
    ) {
        console.log(categoria_tamanho_id, qtd_sabor, preco_inicial);
    }

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

            <div className="sticky top-17 z-10 bg-background pt-4 pb-3 flex flex-col gap-3 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
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

            <section className="flex flex-col gap-4 mt-4">

                {filtrado
                    .filter((categoria) =>
                        categoria.dias_funcionamento.map(Number).includes(HOJE),
                    )
                    .map((categoria, idx) => (
                        <Card key={idx} id={`categoria-${categoria.id}`} className="w-full">
                            <CardHeader>
                                <CardTitle>{categoria.nome}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                            isLoading={loadingItemId === item.id}
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
                                                        <Button
                                                            onClick={() =>
                                                                buscaComboPedido(
                                                                    combo.id,
                                                                )
                                                            }
                                                            className="cursor-pointer"
                                                            asChild
                                                            key={idxcombo}
                                                        >
                                                            <MenuItemCard
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
                                                        </Button>
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
                                                                <Button
                                                                    onClick={() =>
                                                                        buscaPizzaPedido(
                                                                            tamanho.id,
                                                                            qtde,
                                                                            menorValorTamanho,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer"
                                                                    asChild
                                                                    key={
                                                                        idxSabores
                                                                    }
                                                                >
                                                                    <MenuItemCard
                                                                        item={{
                                                                            nome: `${tamanho.nome} ${qtde >
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
                                                                </Button>
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

            <ModalItens item={itemModal} open={openModalPedido} setOpen={setOpenModalPedido} adicionaQtde={adicionaQtdeItemSelecionado} diminuiQtde={diminuiQtdeItemSelecionado} adicionaObservacao={adicionaObservacao}/>
        </LayoutCardapio>
    );
}
