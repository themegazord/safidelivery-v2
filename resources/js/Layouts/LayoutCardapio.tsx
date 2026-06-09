import { ReactNode, useState } from "react";

interface IProps {
    children: ReactNode
    recebeInteracaoId: string,
    recebeTipoFuncionamento: string
}

export default function LayoutCardapio({ children, recebeInteracaoId, recebeTipoFuncionamento }: IProps) {

    const [interacaoId, setInteracaoId] = useState<string>("")
    const [tipoFuncionamento, setTipoFuncionamento] = useState<string>("")

    setInteracaoId(recebeInteracaoId)
    setTipoFuncionamento(recebeTipoFuncionamento)

    return (
        <main className="container">
            <nav></nav>
            {children}
        </main>
    );
}
