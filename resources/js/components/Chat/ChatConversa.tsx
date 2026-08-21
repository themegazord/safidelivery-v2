import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useEcho } from "@laravel/echo-react";
import {
    Bubble,
    BubbleContent,
} from "@/components/ui/bubble";
import {
    Message,
    MessageContent,
    MessageFooter,
    MessageGroup,
} from "@/components/ui/message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Send } from "lucide-react";
import { TEventoNovaMensagem, TMensagemChat } from "@/types/chat/types";

interface IProps {
    pedidoId: number;
    pedidoCodigo: number | string;
    usuarioId: number;
    titulo: string;
    rotaMensagens: (pedidoId: number) => string;
    rotaEnviar: (pedidoId: number) => string;
    onVoltar: () => void;
    onLida: (pedidoId: number) => void;
    onNovaMensagem: (pedidoId: number, mensagem: TMensagemChat) => void;
}

function formataHora(dataIso: string) {
    return new Date(dataIso).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ChatConversa({
    pedidoId,
    pedidoCodigo,
    usuarioId,
    titulo,
    rotaMensagens,
    rotaEnviar,
    onVoltar,
    onLida,
    onNovaMensagem,
}: IProps) {
    const [mensagens, setMensagens] = useState<TMensagemChat[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [novaMensagem, setNovaMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);
    const fimMensagensRef = useRef<HTMLDivElement>(null);

    async function buscarMensagens() {
        const { data } = await axios.get(rotaMensagens(pedidoId));
        setMensagens(data.mensagens);
        onLida(pedidoId);
    }

    useEffect(() => {
        setCarregando(true);
        buscarMensagens().finally(() => setCarregando(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pedidoId]);

    useEffect(() => {
        fimMensagensRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensagens]);

    useEcho<TEventoNovaMensagem>(
        `EnviaMensagemSobrePedido.${pedidoId}`,
        ".EnviaMensagemSobrePedido",
        (payload) => {
            if (payload.mensagem.usuario_id === usuarioId) return;
            buscarMensagens();
            onNovaMensagem(pedidoId, payload.mensagem);
        },
        [pedidoId, usuarioId],
    );

    async function enviar() {
        const texto = novaMensagem.trim();
        if (!texto) return;

        setEnviando(true);
        setNovaMensagem("");
        await axios
            .post(rotaEnviar(pedidoId), { mensagem: texto })
            .then((response) => {
                setMensagens((atual) => [...atual, response.data.mensagem]);
            })
            .catch(() => {
                toast.error("Não foi possível enviar a mensagem");
                setNovaMensagem(texto);
            })
            .finally(() => setEnviando(false));
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 border-b px-4 py-3">
                <Button type="button" variant="ghost" size="icon" onClick={onVoltar}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0">
                    <p className="truncate font-semibold">{titulo}</p>
                    <p className="truncate text-xs text-muted-foreground">Pedido #{pedidoCodigo}</p>
                </div>
            </div>

            <ScrollArea className="min-h-0 flex-1 px-4">
                <div className="flex flex-col gap-3 py-4">
                    {carregando ? (
                        <div className="flex justify-center py-8">
                            <Spinner />
                        </div>
                    ) : mensagens.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Envie a primeira mensagem para {titulo}.
                        </p>
                    ) : (
                        <MessageGroup>
                            {mensagens.map((mensagem) => {
                                const minha = mensagem.usuario_id === usuarioId;
                                return (
                                    <Message key={mensagem.uuid} align={minha ? "end" : "start"}>
                                        <MessageContent>
                                            <Bubble
                                                align={minha ? "end" : "start"}
                                                variant={minha ? "default" : "muted"}
                                            >
                                                <BubbleContent>{mensagem.mensagem}</BubbleContent>
                                            </Bubble>
                                            <MessageFooter>{formataHora(mensagem.created_at)}</MessageFooter>
                                        </MessageContent>
                                    </Message>
                                );
                            })}
                        </MessageGroup>
                    )}
                    <div ref={fimMensagensRef} />
                </div>
            </ScrollArea>

            <div className="flex items-center gap-2 border-t p-3">
                <Input
                    placeholder="Escreva uma mensagem..."
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            enviar();
                        }
                    }}
                />
                <Button type="button" size="icon" onClick={enviar} disabled={enviando || !novaMensagem.trim()}>
                    {enviando ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
}
