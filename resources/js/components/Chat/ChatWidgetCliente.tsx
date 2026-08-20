import { usePage } from "@inertiajs/react";
import { IAuth } from "@/types/usuario-autenticado/usuario";
import ChatWidget from "@/components/Chat/ChatWidget";

export default function ChatWidgetCliente() {
    const { auth } = usePage<{ auth: IAuth }>().props;

    if (!auth?.user?.cliente) return null;

    const usuarioId = auth.user.id;

    return (
        <ChatWidget
            usuarioId={usuarioId}
            rotaConversas={route("aplicacao.cliente.chat.conversas")}
            rotaMensagens={(pedidoId) => route("aplicacao.cliente.chat.mensagens", { pedido_id: pedidoId })}
            rotaEnviar={(pedidoId) =>
                route("aplicacao.cliente.chat.mensagens.store", { pedido_id: pedidoId })
            }
        />
    );
}
