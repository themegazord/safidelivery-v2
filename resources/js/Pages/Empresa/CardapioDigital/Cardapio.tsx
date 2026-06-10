import { H4 } from "@/components/utils/Heading"
import LayoutCardapio from "@/Layouts/LayoutCardapio"

interface IProps {
    interacao_id: string,
    tipo_funcionamento: string,
    capa?: string,
    logo?: string,
    nome_fantasia: string
}

export default function Cardapio({
    interacao_id,
    tipo_funcionamento,
    capa,
    logo,
    nome_fantasia,

}: IProps) {
    return (
        <LayoutCardapio recebeInteracaoId={interacao_id} recebeTipoFuncionamento={tipo_funcionamento}>
            {/* Hero Section */}
            <section className="flex flex-col gap-4">
                {capa ? (
                    <img src={capa} className="h-64 flex justify-center items-center w-full border border-border object-cover rounded-xl" alt={`Capa da loja ${nome_fantasia}`} />
                ) : (
                    <div className="h-64 flex justify-center items-center w-full border border-border rounded-xl">
                        Não possui capa configurada
                    </div>
                )}
                <div className="flex gap-2 items-center">
                    {logo ? (
                        <img src={logo} className="rounded-xl size-20" alt={`Logo da loja ${nome_fantasia}`} />
                    ) : (
                        <div className="rounded-xl size-20 text-wrap border border-border flex justify-center items-center text-center">
                            Sem logo
                        </div>
                    )}
                    <H4>{nome_fantasia}</H4>
                </div>
            </section>
            {/* End Hero Section */}
        </LayoutCardapio>
    )
}
