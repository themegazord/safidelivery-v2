import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import ModalItemCombo from "@/components/Empresa/CardapioDigital/Modais/ModalItemCombo";
import { Spinner } from "@/components/ui/spinner";
import {
    IGrupoComplementoCombo,
    IItemCombo,
    TManipulaPedidoItem,
} from "@/types/cardapio-digital/item-pedido";

interface IProps {
    comboId: number;
    onCancelar: () => void;
    onConfirmar: (combo: IItemCombo) => void;
}

function somaQtdeGrupo(itens: { quantidade: number }[]): number {
    return itens.reduce((acc, item) => acc + item.quantidade, 0);
}

export default function SelecaoPremioCombo({
    comboId,
    onCancelar,
    onConfirmar,
}: IProps) {
    const [combo, setCombo] = useState<IItemCombo | undefined>(undefined);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        axios
            .post(route("aplicacao.empresa.finalizar-pedido.detalhe-premio-combo"), {
                combo_id: comboId,
            })
            .then((response) => setCombo(response.data))
            .finally(() => setCarregando(false));
    }, [comboId]);

    const adicionaQtde: TManipulaPedidoItem = (
        alvo,
        grupoIdx,
        _c,
        _s,
        itemComboIdx,
        complementoComboIdx,
    ) => {
        setCombo((atual) => {
            if (!atual) return atual;

            if (alvo === "itemCombo" && grupoIdx !== undefined && itemComboIdx !== undefined) {
                const grupos = atual.grupos.map((grupo, gIdx) => {
                    if (gIdx !== grupoIdx) return grupo;

                    const itens = grupo.itens.map((item, iIdx) =>
                        iIdx === itemComboIdx
                            ? { ...item, quantidade: item.quantidade + 1 }
                            : item,
                    );

                    return {
                        ...grupo,
                        itens,
                        quantidade_selecionada: somaQtdeGrupo(itens),
                        bloqueado: somaQtdeGrupo(itens) >= grupo.qtd_maxima,
                    };
                });

                return { ...atual, grupos };
            }

            if (
                alvo === "complementoCombo" &&
                grupoIdx !== undefined &&
                complementoComboIdx !== undefined
            ) {
                const gcEntries = Object.entries(atual.grupos_complemento);
                const [gcKey, gc] = gcEntries[grupoIdx];
                const complementosEntries = Object.entries(gc.complementos);
                const [compKey] = complementosEntries[complementoComboIdx];

                const novosComplementos = {
                    ...gc.complementos,
                    [compKey]: {
                        ...gc.complementos[compKey],
                        quantidade: gc.complementos[compKey].quantidade + 1,
                    },
                };

                const qtdeSelecionada = somaQtdeGrupo(
                    Object.values(novosComplementos),
                );

                const novoGc: IGrupoComplementoCombo = {
                    ...gc,
                    complementos: novosComplementos,
                    quantidade_selecionada: qtdeSelecionada,
                    bloqueado: qtdeSelecionada >= gc.qtd_maxima,
                };

                return {
                    ...atual,
                    grupos_complemento: {
                        ...atual.grupos_complemento,
                        [gcKey]: novoGc,
                    },
                };
            }

            return atual;
        });
    };

    const diminuiQtde: TManipulaPedidoItem = (
        alvo,
        grupoIdx,
        _c,
        _s,
        itemComboIdx,
        complementoComboIdx,
    ) => {
        setCombo((atual) => {
            if (!atual) return atual;

            if (alvo === "itemCombo" && grupoIdx !== undefined && itemComboIdx !== undefined) {
                const grupos = atual.grupos.map((grupo, gIdx) => {
                    if (gIdx !== grupoIdx) return grupo;

                    const itens = grupo.itens.map((item, iIdx) =>
                        iIdx === itemComboIdx && item.quantidade > 0
                            ? { ...item, quantidade: item.quantidade - 1 }
                            : item,
                    );

                    return {
                        ...grupo,
                        itens,
                        quantidade_selecionada: somaQtdeGrupo(itens),
                        bloqueado: somaQtdeGrupo(itens) >= grupo.qtd_maxima,
                    };
                });

                return { ...atual, grupos };
            }

            if (
                alvo === "complementoCombo" &&
                grupoIdx !== undefined &&
                complementoComboIdx !== undefined
            ) {
                const gcEntries = Object.entries(atual.grupos_complemento);
                const [gcKey, gc] = gcEntries[grupoIdx];
                const complementosEntries = Object.entries(gc.complementos);
                const [compKey] = complementosEntries[complementoComboIdx];

                if (gc.complementos[compKey].quantidade <= 0) {
                    return atual;
                }

                const novosComplementos = {
                    ...gc.complementos,
                    [compKey]: {
                        ...gc.complementos[compKey],
                        quantidade: gc.complementos[compKey].quantidade - 1,
                    },
                };

                const qtdeSelecionada = somaQtdeGrupo(
                    Object.values(novosComplementos),
                );

                const novoGc: IGrupoComplementoCombo = {
                    ...gc,
                    complementos: novosComplementos,
                    quantidade_selecionada: qtdeSelecionada,
                    bloqueado: qtdeSelecionada >= gc.qtd_maxima,
                };

                return {
                    ...atual,
                    grupos_complemento: {
                        ...atual.grupos_complemento,
                        [gcKey]: novoGc,
                    },
                };
            }

            return atual;
        });
    };

    function gruposIncompletos(): number[] {
        if (!combo) return [];
        return combo.grupos
            .filter(
                (g) =>
                    g.obrigatorio &&
                    somaQtdeGrupo(g.itens) < Math.max(1, g.qtd_minima),
            )
            .map((g) => g.id);
    }

    function gruposComplementoIncompletos(): number[] {
        if (!combo) return [];
        return Object.values(combo.grupos_complemento)
            .filter(
                (gc) =>
                    gc.obrigatorio &&
                    somaQtdeGrupo(Object.values(gc.complementos)) <
                        Math.max(1, gc.qtd_minima),
            )
            .map((gc) => gc.id);
    }

    function confirmar() {
        const gruposItens = gruposIncompletos();
        const gruposComp = gruposComplementoIncompletos();

        if (gruposItens.length > 0 || gruposComp.length > 0) {
            const nomes = [
                ...combo!.grupos.filter((g) => gruposItens.includes(g.id)).map((g) => g.nome),
                ...Object.values(combo!.grupos_complemento)
                    .filter((gc) => gruposComp.includes(gc.id))
                    .map((gc) => gc.nome),
            ].join(", ");
            toast.error(`Complete as opções obrigatórias: ${nomes}`);
            return;
        }

        onConfirmar(combo!);
    }

    if (carregando || !combo) {
        return (
            <div className="flex items-center justify-center p-12">
                <Spinner />
            </div>
        );
    }

    return (
        <ModalItemCombo
            item={combo}
            open
            setOpen={onCancelar}
            adicionaQtde={adicionaQtde}
            diminuiQtde={diminuiQtde}
            adicionaObservacao={() => {}}
            adicionaItemCarrinho={confirmar}
            gruposComplementosInvalidos={gruposComplementoIncompletos()}
            grupoItensInvalidos={gruposIncompletos()}
        />
    );
}
