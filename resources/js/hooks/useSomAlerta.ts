import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useSomAlerta(src: string) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const usuarioInteragiu = useRef(false);

    useEffect(() => {
        audioRef.current = new Audio(src);
        audioRef.current.preload = "auto";

        const marcaInteracao = () => {
            usuarioInteragiu.current = true;
        };
        document.addEventListener("click", marcaInteracao, { once: true });
        document.addEventListener("keydown", marcaInteracao, { once: true });

        return () => {
            document.removeEventListener("click", marcaInteracao);
            document.removeEventListener("keydown", marcaInteracao);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function tocar() {
        const som = audioRef.current;
        if (!som) return;

        som.currentTime = 0;
        const playPromise = som.play();

        if (playPromise !== undefined) {
            playPromise.catch(() => {
                if (!usuarioInteragiu.current) {
                    toast.warning("Novo pedido recebido! Clique na página para ativar o som.");
                }
            });
        }
    }

    function pausar() {
        audioRef.current?.pause();
    }

    function pausarComDelay(ms: number) {
        setTimeout(() => audioRef.current?.pause(), ms);
    }

    return { tocar, pausar, pausarComDelay };
}
