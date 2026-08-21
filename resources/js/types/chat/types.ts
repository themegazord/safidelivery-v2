export type TMensagemChat = {
    uuid: string;
    chat_id: number;
    usuario_id: number;
    usuario_nome: string | null;
    mensagem: string;
    visualizado_em: string | null;
    created_at: string;
};

export type TConversa = {
    pedido_id: number;
    pedido_codigo: number | string;
    pedido_status: string;
    titulo: string;
    ultima_mensagem: TMensagemChat | null;
    nao_lidas: number;
};

export type TEventoNovaMensagem = {
    mensagem: TMensagemChat;
    pedido_id: number;
};
