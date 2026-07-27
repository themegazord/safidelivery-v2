import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import ModalItensPizza from "@/components/Empresa/CardapioDigital/Modais/ModalItensPizza";
import { Spinner } from "@/components/ui/spinner";
import { IItemPizza, TManipulaPedidoItem } from "@/types/cardapio-digital/item-pedido";

interface IProps {
    tamanhoId: number;
    onCancelar: () => void;
    onConfirmar: (pizza: IItemPizza) => void;
}

export default function SelecaoPremioPizza({
    tamanhoId,
    onCancelar,
    onConfirmar,
}: IProps) {
    const [pizza, setPizza] = useState<IItemPizza | undefined>(undefined);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        axios
            .post(route("aplicacao.empresa.finalizar-pedido.detalhe-premio-pizza"), {
                tamanho_id: tamanhoId,
            })
            .then((response) => setPizza(response.data.tamanho))
            .finally(() => setCarregando(false));
    }, [tamanhoId]);

    const adicionaQtde: TManipulaPedidoItem = (alvo, _g, _c, saborIdx) => {
        if (alvo !== "sabor" || saborIdx === undefined) return;

        setPizza((atual) => {
            if (!atual) return atual;

            const sabores = atual.sabores.map((sabor, idx) => ({
                ...sabor,
                quantidade: idx === saborIdx ? 1 : 0,
            }));

            const saborEscolhido = sabores[saborIdx];

            return {
                ...atual,
                sabores,
                quantidade_sabores_selecionadas: 1,
                massaSelecionada: atual.massaSelecionada,
                total:
                    saborEscolhido.preco +
                    (atual.massaSelecionada?.preco ?? 0) +
                    (atual.bordaSelecionada?.preco ?? 0),
            };
        });
    };

    const diminuiQtde: TManipulaPedidoItem = (alvo, _g, _c, saborIdx) => {
        if (alvo !== "sabor" || saborIdx === undefined) return;

        setPizza((atual) => {
            if (!atual) return atual;

            const sabores = atual.sabores.map((sabor, idx) =>
                idx === saborIdx ? { ...sabor, quantidade: 0 } : sabor,
            );

            return {
                ...atual,
                sabores,
                quantidade_sabores_selecionadas: 0,
                total:
                    (atual.massaSelecionada?.preco ?? 0) +
                    (atual.bordaSelecionada?.preco ?? 0),
            };
        });
    };

    function recalculaTotal(pizzaAtual: IItemPizza): number {
        const saborSelecionado = pizzaAtual.sabores.find(
            (s) => s.quantidade > 0,
        );
        return (
            (saborSelecionado?.preco ?? 0) +
            (pizzaAtual.massaSelecionada?.preco ?? 0) +
            (pizzaAtual.bordaSelecionada?.preco ?? 0)
        );
    }

    function defineMassaSelecionada(value: string) {
        setPizza((atual) => {
            if (!atual) return atual;
            const massaSelecionada = atual.massas.find(
                (m) => String(m.id) === value,
            );
            const proximo = { ...atual, massaSelecionada };
            return { ...proximo, total: recalculaTotal(proximo) };
        });
    }

    function defineBordaSelecionada(value: string) {
        setPizza((atual) => {
            if (!atual) return atual;
            const bordaSelecionada = atual.bordas.find(
                (b) => String(b.id) === value,
            );
            const proximo = { ...atual, bordaSelecionada };
            return { ...proximo, total: recalculaTotal(proximo) };
        });
    }

    function pendencias(pizzaAtual: IItemPizza) {
        return {
            sabores: pizzaAtual.quantidade_sabores_selecionadas < 1,
            massa:
                pizzaAtual.massas.length > 0 && !pizzaAtual.massaSelecionada,
            borda:
                pizzaAtual.bordas.length > 0 && !pizzaAtual.bordaSelecionada,
        };
    }

    function confirmar() {
        const pendenciasAtuais = pendencias(pizza!);

        if (
            pendenciasAtuais.sabores ||
            pendenciasAtuais.massa ||
            pendenciasAtuais.borda
        ) {
            toast.error(
                "Selecione o sabor" +
                    (pizza!.massas.length > 0 ? ", a massa" : "") +
                    (pizza!.bordas.length > 0 ? " e a borda" : "") +
                    " antes de confirmar.",
            );
            return;
        }

        onConfirmar(pizza!);
    }

    if (carregando || !pizza) {
        return (
            <div className="flex items-center justify-center p-12">
                <Spinner />
            </div>
        );
    }

    return (
        <ModalItensPizza
            item={pizza}
            open
            setOpen={onCancelar}
            adicionaQtde={adicionaQtde}
            diminuiQtde={diminuiQtde}
            adicionaObservacao={() => {}}
            adicionaItemCarrinho={confirmar}
            defineMassaSelecionada={defineMassaSelecionada}
            defineBordaSelecionada={defineBordaSelecionada}
            pendenciasDeItens={pendencias(pizza)}
        />
    );
}
