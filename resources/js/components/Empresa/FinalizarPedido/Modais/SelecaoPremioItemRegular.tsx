import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import ModalItens from "@/components/Empresa/CardapioDigital/Modais/ModalItens";
import { Spinner } from "@/components/ui/spinner";
import { IItemPedido, TManipulaPedidoItem } from "@/types/cardapio-digital/item-pedido";

interface IProps {
    itemId: number;
    onCancelar: () => void;
    onConfirmar: (item: IItemPedido) => void;
}

function somaQtdeGrupo(complementos: { quantidade: number }[]): number {
    return complementos.reduce((acc, c) => acc + c.quantidade, 0);
}

export default function SelecaoPremioItemRegular({
    itemId,
    onCancelar,
    onConfirmar,
}: IProps) {
    const [item, setItem] = useState<IItemPedido | undefined>(undefined);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        axios
            .post(route("aplicacao.empresa.finalizar-pedido.detalhe-premio-item"), {
                item_id: itemId,
            })
            .then((response) => setItem(response.data.item))
            .finally(() => setCarregando(false));
    }, [itemId]);

    // Sem complementos configurados: confirma direto assim que carregar.
    useEffect(() => {
        if (item && item.grupo_complemento.length === 0) {
            onConfirmar(item);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item]);

    const adicionaQtde: TManipulaPedidoItem = (alvo, grupoIdx, complementoIdx) => {
        if (alvo !== "complemento" || grupoIdx === undefined || complementoIdx === undefined) return;

        setItem((atual) => {
            if (!atual) return atual;

            const grupo_complemento = atual.grupo_complemento.map((grupo, gIdx) => {
                if (gIdx !== grupoIdx) return grupo;

                const totalAtual = somaQtdeGrupo(grupo.complementos);
                if (totalAtual >= grupo.qtd_maxima) return grupo;

                const complementos = grupo.complementos.map((c, cIdx) =>
                    cIdx === complementoIdx
                        ? { ...c, quantidade: c.quantidade + 1 }
                        : c,
                );

                return { ...grupo, complementos };
            });

            return { ...atual, grupo_complemento };
        });
    };

    const diminuiQtde: TManipulaPedidoItem = (alvo, grupoIdx, complementoIdx) => {
        if (alvo !== "complemento" || grupoIdx === undefined || complementoIdx === undefined) return;

        setItem((atual) => {
            if (!atual) return atual;

            const grupo_complemento = atual.grupo_complemento.map((grupo, gIdx) => {
                if (gIdx !== grupoIdx) return grupo;

                const complementos = grupo.complementos.map((c, cIdx) =>
                    cIdx === complementoIdx && c.quantidade > 0
                        ? { ...c, quantidade: c.quantidade - 1 }
                        : c,
                );

                return { ...grupo, complementos };
            });

            return { ...atual, grupo_complemento };
        });
    };

    function gruposInvalidos(): number[] {
        if (!item) return [];
        return item.grupo_complemento
            .filter(
                (grupo) =>
                    grupo.obrigatoriedade &&
                    somaQtdeGrupo(grupo.complementos) <
                        Math.max(1, grupo.qtd_minima),
            )
            .map((grupo) => grupo.id);
    }

    function confirmar() {
        const invalidos = gruposInvalidos();
        if (invalidos.length > 0) {
            const nomes = item!.grupo_complemento
                .filter((grupo) => invalidos.includes(grupo.id))
                .map((grupo) => grupo.nome)
                .join(", ");
            toast.error(`Complete as opções obrigatórias: ${nomes}`);
            return;
        }

        onConfirmar(item!);
    }

    if (carregando || !item || item.grupo_complemento.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <Spinner />
            </div>
        );
    }

    return (
        <ModalItens
            item={item}
            open
            setOpen={onCancelar}
            adicionaQtde={adicionaQtde}
            diminuiQtde={diminuiQtde}
            adicionaObservacao={() => {}}
            adicionaItemCarrinho={confirmar}
            gruposComplementosInvalidos={gruposInvalidos()}
        />
    );
}
