import { useEffect, useState } from "react";
import axios from "axios";
import { useEcho } from "@laravel/echo-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { TConversa, TEventoNovaMensagem, TMensagemChat } from "@/types/chat/types";
import ChatConversa from "@/components/Chat/ChatConversa";

interface IProps {
    usuarioId: number;
    rotaConversas: string;
    rotaMensagens: (pedidoId: number) => string;
    rotaEnviar: (pedidoId: number) => string;
}

function ConversaListener({
    pedidoId,
    usuarioId,
    onNovaMensagem,
}: {
    pedidoId: number;
    usuarioId: number;
    onNovaMensagem: (pedidoId: number, mensagem: TMensagemChat) => void;
}) {
    useEcho<TEventoNovaMensagem>(
        `EnviaMensagemSobrePedido.${pedidoId}`,
        ".EnviaMensagemSobrePedido",
        (payload) => {
            if (payload.mensagem.usuario_id === usuarioId) return;
            onNovaMensagem(pedidoId, payload.mensagem);
        },
        [pedidoId, usuarioId],
    );

    return null;
}

export default function ChatWidget({ usuarioId, rotaConversas, rotaMensagens, rotaEnviar }: IProps) {
    const [aberto, setAberto] = useState(false);
    const [conversas, setConversas] = useState<TConversa[]>([]);
    const [pedidoAberto, setPedidoAberto] = useState<number | null>(null);

    async function buscarConversas() {
        const { data } = await axios.get(rotaConversas);
        setConversas(data.conversas);
    }

    useEffect(() => {
        buscarConversas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function marcaConversaComoLida(pedidoId: number) {
        setConversas((atual) =>
            atual.map((conversa) =>
                conversa.pedido_id === pedidoId ? { ...conversa, nao_lidas: 0 } : conversa,
            ),
        );
    }

    function registraNovaMensagem(pedidoId: number, mensagem: TMensagemChat) {
        setConversas((atual) => {
            const existe = atual.some((conversa) => conversa.pedido_id === pedidoId);
            const atualizadas = existe
                ? atual.map((conversa) =>
                      conversa.pedido_id === pedidoId
                          ? {
                                ...conversa,
                                ultima_mensagem: mensagem,
                                nao_lidas:
                                    pedidoAberto === pedidoId ? conversa.nao_lidas : conversa.nao_lidas + 1,
                            }
                          : conversa,
                  )
                : atual;

            return [...atualizadas].sort((a, b) => a.pedido_id === pedidoId ? -1 : b.pedido_id === pedidoId ? 1 : 0);
        });
    }

    const totalNaoLidas = conversas.reduce((total, conversa) => total + conversa.nao_lidas, 0);
    const conversaAberta = conversas.find((conversa) => conversa.pedido_id === pedidoAberto) ?? null;

    return (
        <>
            {conversas.map((conversa) => (
                <ConversaListener
                    key={conversa.pedido_id}
                    pedidoId={conversa.pedido_id}
                    usuarioId={usuarioId}
                    onNovaMensagem={registraNovaMensagem}
                />
            ))}

            <Button
                type="button"
                onClick={() => setAberto(true)}
                className="fixed right-6 bottom-6 z-40 h-14 w-14 rounded-full shadow-lg"
                size="icon"
            >
                <MessageCircle className="h-6 w-6" />
                {totalNaoLidas > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1" variant="destructive">
                        {totalNaoLidas > 9 ? "9+" : totalNaoLidas}
                    </Badge>
                )}
            </Button>

            <Sheet
                open={aberto}
                onOpenChange={(valor) => {
                    setAberto(valor);
                    if (!valor) setPedidoAberto(null);
                }}
            >
                <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-sm">
                    {conversaAberta ? (
                        <ChatConversa
                            pedidoId={conversaAberta.pedido_id}
                            usuarioId={usuarioId}
                            titulo={conversaAberta.titulo}
                            rotaMensagens={rotaMensagens}
                            rotaEnviar={rotaEnviar}
                            onVoltar={() => setPedidoAberto(null)}
                            onLida={marcaConversaComoLida}
                            onNovaMensagem={registraNovaMensagem}
                        />
                    ) : (
                        <>
                            <SheetHeader>
                                <SheetTitle>Conversas</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="flex-1 px-4">
                                {conversas.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        Nenhuma conversa disponível no momento.
                                    </p>
                                ) : (
                                    <div className="flex flex-col divide-y pb-4">
                                        {conversas.map((conversa) => (
                                            <button
                                                key={conversa.pedido_id}
                                                type="button"
                                                onClick={() => setPedidoAberto(conversa.pedido_id)}
                                                className="flex items-center justify-between gap-3 py-3 text-left hover:bg-muted/40"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold">{conversa.titulo}</p>
                                                    <p className="truncate text-sm text-muted-foreground">
                                                        {conversa.ultima_mensagem?.mensagem ??
                                                            "Nenhuma mensagem ainda"}
                                                    </p>
                                                </div>
                                                {conversa.nao_lidas > 0 && (
                                                    <Badge variant="destructive" className="shrink-0">
                                                        {conversa.nao_lidas}
                                                    </Badge>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}
