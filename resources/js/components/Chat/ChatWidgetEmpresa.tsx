import { usePage } from "@inertiajs/react";
import ChatWidget from "@/components/Chat/ChatWidget";

interface IProps {
    cnpj?: string;
    auth?: { user: { id: number } | null };
    [key: string]: unknown;
}

export default function ChatWidgetEmpresa() {
    const { cnpj, auth } = usePage<IProps>().props;

    if (!cnpj || !auth?.user) return null;

    return (
        <ChatWidget
            usuarioId={auth.user.id}
            rotaConversas={route("aplicacao.empresa.chat.conversas", { cnpj })}
            rotaMensagens={(pedidoId) =>
                route("aplicacao.empresa.chat.mensagens", { cnpj, pedido_id: pedidoId })
            }
            rotaEnviar={(pedidoId) =>
                route("aplicacao.empresa.chat.mensagens.store", { cnpj, pedido_id: pedidoId })
            }
        />
    );
}
