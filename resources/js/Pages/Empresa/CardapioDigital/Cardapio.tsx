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
import { useContext, useEffect, useState } from "react";
import ModalItens from "@/components/Empresa/CardapioDigital/Modais/ModalItens";
import {
    IGrupoComplemento,
    IGrupoItensCombo,
    IItemCombo,
    IItemPedido,
    IItemPizza,
} from "@/types/cardapio-digital/item-pedido";
import { CarrinhoContext } from "@/contexts/CardapioDigital/CarrinhoContext";
import { ReactNode } from "react";
import ModalItensPizza from "@/components/Empresa/CardapioDigital/Modais/ModalItensPizza";
import ModalItemCombo from "@/components/Empresa/CardapioDigital/Modais/ModalItemCombo";

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
    const [openModalPedido, setOpenModalPedido] = useState<
        "item" | "combo" | "pizza" | null
    >(null);
    const [grupoItensInvalidos, setGruposItensInvalidos] = useState<
        number[]
    >([]);
    const [grupoComplementosInvalidos, setGrupoComplementoInvalidos] = useState<
        number[]
    >([]);

    const [pendenciaPizza, setPendenciaPizza] = useState<{
        massa: boolean;
        borda: boolean;
        sabores: boolean;
    }>({ massa: false, borda: false, sabores: false });

    const [itemModal, setItemModal] = useState<
        IItemPedido | IItemPizza | IItemCombo
    >();

    const { adicionaItemCarrinho } = useContext(CarrinhoContext);

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

    function calculaTotal(item: IItemPedido | IItemPizza | IItemCombo): number {
        if ("grupo_complemento" in item) {
            const precoBase = Number(
                item.desconto ? item.valor_desconto : item.preco,
            );

            const totalComplementos = item.grupo_complemento.reduce(
                (acc, g) =>
                    acc +
                    g.complementos.reduce(
                        (soma, c) =>
                            soma +
                            item.quantidade * (c.quantidade * Number(c.preco)),
                        0,
                    ),
                0,
            );

            return item.quantidade * precoBase + totalComplementos;
        }

        if ("sabores" in item) {
            const totalSabores = item.sabores.reduce(
                (acc, sabor) => acc + sabor.quantidade * sabor.preco,
                0,
            );

            return (
                item.quantidade *
                (totalSabores +
                    (item.massaSelecionada?.preco ?? 0) +
                    (item.bordaSelecionada?.preco ?? 0))
            );
        }

        if ("grupos" in item) {
            const precoBase = item.tipo_preco === "preco_combo" ? item.preco_fixo : 0;

            const totalGrupos = item.tipo_preco === "preco_itens" ? item.grupos.reduce(
                (acc, g) => acc + g.itens.reduce(
                    (soma, i) => soma + i.quantidade * Number(i.preco),
                    0,
                ),
                0,
            ) : 0;

            const totalComplementos = Object.values(item.grupos_complemento).reduce(
                (acc, g) => acc + Object.values(g.complementos).reduce(
                    (soma, c) => soma + c.quantidade * Number(c.preco),
                    0,
                ),
                0,
            );

            return item.quantidade * (precoBase + totalGrupos + totalComplementos);
        }

        return 0;
    }

    function adicionaQtdeItemSelecionado(
        alvo:
            | "item"
            | "complemento"
            | "sabor"
            | "itemCombo"
            | "complementoCombo",
        grupo_idx?: number,
        complemento_idx?: number,
        sabor_idx?: number,
        itemCombo_idx?: number,
        complementoCombo_idx?: number,
    ): void {
        setItemModal((prev) => {
            if (!prev) return prev;

            if (alvo === "item") {
                const atualizado = { ...prev, quantidade: prev.quantidade + 1 };
                return { ...atualizado, total: calculaTotal(atualizado) };
            }

            if ("grupo_complemento" in prev) {
                const grupos = prev.grupo_complemento.map((g, gi) => {
                    if (gi !== grupo_idx) return g;

                    const novosComplementos = g.complementos.map((c, ci) =>
                        ci === complemento_idx
                            ? { ...c, quantidade: c.quantidade + 1 }
                            : c,
                    );

                    const novoTotal = novosComplementos.reduce(
                        (acc, c) => acc + c.quantidade,
                        0,
                    );

                    return {
                        ...g,
                        complementos: novosComplementos,
                        bloqueado: novoTotal >= g.qtd_maxima,
                    };
                });

                const atualizado = { ...prev, grupo_complemento: grupos };
                return { ...atualizado, total: calculaTotal(atualizado) };
            }

            if ("sabores" in prev) {
                const sabores = prev.sabores.map((sabor, idx) => {
                    if (idx !== sabor_idx) return sabor;

                    return {
                        ...sabor,
                        quantidade: sabor.quantidade + 1,
                    };
                });

                const atualizado = { ...prev, sabores: sabores };
                const quantidadeSelecionadoRecalculado =
                    atualizado.sabores.reduce(
                        (acc, sabor) => acc + sabor.quantidade,
                        0,
                    );
                return {
                    ...atualizado,
                    total: calculaTotal(atualizado),
                    quantidade_sabores_selecionadas:
                        quantidadeSelecionadoRecalculado,
                };
            }

            if ("grupos" in prev) {
                if (itemCombo_idx !== undefined) {
                    const grupos = prev.grupos.map((g, gi) => {
                        if (gi !== grupo_idx) return g;

                        const novosItens = g.itens.map((c, ci) =>
                            ci === itemCombo_idx
                                ? { ...c, quantidade: c.quantidade + 1 }
                                : c,
                        );

                        const novoTotal = novosItens.reduce(
                            (acc, c) => acc + c.quantidade,
                            0,
                        );

                        return {
                            ...g,
                            itens: novosItens,
                            bloqueado: novoTotal >= g.qtd_maxima,
                        };
                    });
                    const atualizado = { ...prev, grupos };
                    return { ...atualizado, total: calculaTotal(atualizado) };
                }

                if (complementoCombo_idx !== undefined) {
                    const gruposComplemento = Object.fromEntries(
                        Object.entries(prev.grupos_complemento).map(([key, g], gi) => {
                            if (gi !== grupo_idx) return [key, g];

                            const novosComplementos = Object.fromEntries(
                                Object.entries(g.complementos).map(([ck, c], ci) => [
                                    ck,
                                    ci === complementoCombo_idx
                                        ? { ...c, quantidade: c.quantidade + 1 }
                                        : c,
                                ])
                            );

                            const novoTotal = Object.values(novosComplementos).reduce(
                                (acc, c) => acc + c.quantidade,
                                0,
                            );

                            return [key, {
                                ...g,
                                complementos: novosComplementos,
                                bloqueado: novoTotal >= g.qtd_maxima,
                            }];
                        })
                    );
                    const atualizado = { ...prev, grupos_complemento: gruposComplemento };
                    return { ...atualizado, total: calculaTotal(atualizado) };
                }
            }
        });
    }

    function diminuiQtdeItemSelecionado(
        alvo:
            | "item"
            | "complemento"
            | "sabor"
            | "itemCombo"
            | "complementoCombo",
        grupo_idx?: number,
        complemento_idx?: number,
        sabor_idx?: number,
        itemCombo_idx?: number,
        complementoCombo_idx?: number,
    ): void {
        setItemModal((prev) => {
            if (!prev) return prev;

            if (alvo === "item") {
                const atualizado = {
                    ...prev,
                    quantidade: Math.max(1, prev.quantidade - 1),
                };
                return { ...atualizado, total: calculaTotal(atualizado) };
            }

            if ("grupo_complemento" in prev) {
                const grupos = prev.grupo_complemento.map((g, gi) => {
                    if (gi !== grupo_idx) return g;

                    const novosComplementos = g.complementos.map((c, ci) =>
                        ci === complemento_idx
                            ? { ...c, quantidade: c.quantidade - 1 }
                            : c,
                    );

                    const novoTotal = novosComplementos.reduce(
                        (acc, c) => acc - c.quantidade,
                        0,
                    );

                    return {
                        ...g,
                        complementos: novosComplementos,
                        bloqueado: false,
                    };
                });

                const atualizado = { ...prev, grupo_complemento: grupos };
                return { ...atualizado, total: calculaTotal(atualizado) };
            }

            if ("sabores" in prev) {
                const sabores = prev.sabores.map((sabor, idx) => {
                    if (idx !== sabor_idx) return sabor;

                    return {
                        ...sabor,
                        quantidade: sabor.quantidade - 1,
                    };
                });

                const atualizado = { ...prev, sabores: sabores };
                const quantidadeSelecionadoRecalculado =
                    atualizado.sabores.reduce(
                        (acc, sabor) => acc + sabor.quantidade,
                        0,
                    );
                return {
                    ...atualizado,
                    total: calculaTotal(atualizado),
                    quantidade_sabores_selecionadas:
                        quantidadeSelecionadoRecalculado,
                };
            }

            if ("grupos" in prev) {
                if (itemCombo_idx !== undefined) {
                    const grupos = prev.grupos.map((g, gi) => {
                        if (gi !== grupo_idx) return g;

                        const novosItens = g.itens.map((c, ci) =>
                            ci === itemCombo_idx
                                ? { ...c, quantidade: Math.max(0, c.quantidade - 1) }
                                : c,
                        );

                        const novoTotal = novosItens.reduce(
                            (acc, c) => acc + c.quantidade,
                            0,
                        );

                        return {
                            ...g,
                            itens: novosItens,
                            bloqueado: novoTotal >= g.qtd_maxima,
                        };
                    });
                    const atualizado = { ...prev, grupos };
                    return { ...atualizado, total: calculaTotal(atualizado) };
                }

                if (complementoCombo_idx !== undefined) {
                    const gruposComplemento = Object.fromEntries(
                        Object.entries(prev.grupos_complemento).map(([key, g], gi) => {
                            if (gi !== grupo_idx) return [key, g];

                            const novosComplementos = Object.fromEntries(
                                Object.entries(g.complementos).map(([ck, c], ci) => [
                                    ck,
                                    ci === complementoCombo_idx
                                        ? { ...c, quantidade: Math.max(0, c.quantidade - 1) }
                                        : c,
                                ])
                            );

                            const novoTotal = Object.values(novosComplementos).reduce(
                                (acc, c) => acc + c.quantidade,
                                0,
                            );

                            return [key, {
                                ...g,
                                complementos: novosComplementos,
                                bloqueado: novoTotal >= g.qtd_maxima,
                            }];
                        })
                    );
                    const atualizado = { ...prev, grupos_complemento: gruposComplemento };
                    return { ...atualizado, total: calculaTotal(atualizado) };
                }
            }
        });
    }

    function adicionarItemCarrinho() {
        if (!itemModal) return;

        if ("grupo_complemento" in itemModal) {
            const invalidos =
                itemModal?.grupo_complemento
                    .filter((grupo) => !grupoComplementoValido(grupo))
                    .map((grupo) => grupo.id) ?? [];

            setGrupoComplementoInvalidos(invalidos);

            if (invalidos.length > 0) return;
        }

        if ("sabores" in itemModal) {
            const invalidos = {
                massa: itemModal.massaSelecionada === null,
                borda: itemModal.bordaSelecionada === null,
                sabores:
                    itemModal.quantidade_sabores_selecionadas !==
                    itemModal.quantidade_sabor,
            };

            if (invalidos.massa || invalidos.borda || invalidos.sabores) {
                setPendenciaPizza(invalidos);
                return;
            }
        }

        if ("grupos" in itemModal) {
            const giInvalidos = itemModal?.grupos.filter((gi) => !grupoItemValido(gi)).map((gi) => gi.id) ?? []

            console.log(giInvalidos)

            setGruposItensInvalidos(giInvalidos)

            if (giInvalidos.length > 0) return;
        }

        adicionaItemCarrinho(itemModal);

        setOpenModalPedido(null);
    }

    function adicionaObservacao(observacao: string): void {
        setItemModal((prev) => {
            if (!prev) return prev;
            return { ...prev, observacao: observacao };
        });
    }

    function grupoComplementoValido(
        grupoComplemento: IGrupoComplemento,
    ): boolean {
        if (grupoComplemento.obrigatoriedade) {
            return (
                grupoComplemento.complementos.reduce(
                    (acc, c) => acc + c.quantidade,
                    0,
                ) >= grupoComplemento.qtd_minima
            );
        } else {
            return true;
        }
    }

    function grupoItemValido(
        grupoItem: IGrupoItensCombo,
    ): boolean {
        console.log(grupoItem.itens.reduce(
                    (acc, c) => acc + c.quantidade,
                    0,
                ), grupoItem.qtd_minima, grupoItem.qtd_maxima)
        if (grupoItem.obrigatorio) {
            return (
                grupoItem.itens.reduce(
                    (acc, c) => acc + c.quantidade,
                    0,
                ) >= grupoItem.qtd_minima
            );
        } else {
            return true;
        }
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
            setOpenModalPedido("item");
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
            setItemModal(data);
            setOpenModalPedido("combo");
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

            setItemModal(data.tamanho);
            setOpenModalPedido("pizza");
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingItemId(null);
        }
    }

    function defineMassaSelecionada(value: string): void {
        setItemModal((prev) => {
            if (!prev || !("sabores" in prev)) return prev;

            const atualizado = {
                ...prev,
                massaSelecionada: prev.massas.find(
                    (m) => m.id === Number(value),
                ),
            };
            return { ...atualizado, total: calculaTotal(atualizado) };
        });
    }

    function defineBordaSelecionada(value: string): void {
        setItemModal((prev) => {
            if (!prev || !("sabores" in prev)) return prev;

            const atualizado = {
                ...prev,
                bordaSelecionada: prev.bordas.find(
                    (b) => b.id === Number(value),
                ),
            };
            return { ...atualizado, total: calculaTotal(atualizado) };
        });
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

            <ModalItens
                item={
                    itemModal !== undefined && "grupo_complemento" in itemModal
                        ? itemModal
                        : undefined
                }
                open={openModalPedido === "item"}
                setOpen={setOpenModalPedido}
                adicionaQtde={adicionaQtdeItemSelecionado}
                diminuiQtde={diminuiQtdeItemSelecionado}
                adicionaObservacao={adicionaObservacao}
                adicionaItemCarrinho={adicionarItemCarrinho}
                gruposComplementosInvalidos={grupoComplementosInvalidos}
            />
            <ModalItensPizza
                item={
                    itemModal !== undefined && "sabores" in itemModal
                        ? itemModal
                        : undefined
                }
                open={openModalPedido === "pizza"}
                setOpen={setOpenModalPedido}
                adicionaQtde={adicionaQtdeItemSelecionado}
                diminuiQtde={diminuiQtdeItemSelecionado}
                adicionaObservacao={adicionaObservacao}
                adicionaItemCarrinho={adicionarItemCarrinho}
                defineBordaSelecionada={defineBordaSelecionada}
                defineMassaSelecionada={defineMassaSelecionada}
                pendenciasDeItens={pendenciaPizza}
            />
            <ModalItemCombo
                item={
                    itemModal !== undefined && "grupos" in itemModal
                        ? itemModal
                        : undefined
                }
                open={openModalPedido === "combo"}
                setOpen={setOpenModalPedido}
                adicionaQtde={adicionaQtdeItemSelecionado}
                diminuiQtde={diminuiQtdeItemSelecionado}
                adicionaObservacao={adicionaObservacao}
                adicionaItemCarrinho={adicionarItemCarrinho}
                gruposComplementosInvalidos={grupoComplementosInvalidos}
                grupoItensInvalidos={grupoItensInvalidos}
            />
        </>
    );
}

Cardapio.layout = (page: ReactNode) => <LayoutCardapio>{page}</LayoutCardapio>;
