import { useEffect, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
import { useSomAlerta } from "@/hooks/useSomAlerta";

export default function EscutaNovosPedidos() {
    const { cnpj } = usePage<{ cnpj?: string }>().props;
    const { tocar: tocarSom } = useSomAlerta("/sons/alerta.mp3");
    const emExecucao = useRef(false);

    useEffect(() => {
        if (!cnpj) return;

        const intervalo = setInterval(async () => {
            if (emExecucao.current) return;
            emExecucao.current = true;

            try {
                const { data } = await axios.get(route("aplicacao.empresa.pedidos.verifica-novos", { cnpj }));

                if (data.tocar_som) {
                    tocarSom();
                    toast.info("Novo pedido recebido!", {
                        action: {
                            label: "Ver pedidos",
                            onClick: () => router.visit(route("aplicacao.empresa.pedidos.index", { cnpj })),
                        },
                    });
                }
            } catch {
                // silencioso: próxima checagem tenta de novo
            } finally {
                emExecucao.current = false;
            }
        }, 5000);

        return () => clearInterval(intervalo);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cnpj]);

    return null;
}
