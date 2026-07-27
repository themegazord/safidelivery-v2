import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
import FormularioPromocao from "@/components/Empresa/Promocoes/FormularioPromocao";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import { IPromocaoFormData } from "@/types/empresa/promocoes/types";

type EdicaoPromocaoProps = {
    cupomId: string;
    promocao: IPromocaoFormData;
};

export default function EdicaoPromocao({
    cupomId,
    promocao,
}: EdicaoPromocaoProps) {
    const { cnpj } = usePage<{ cnpj: string }>().props;
    const [salvando, setSalvando] = useState(false);
    const [erros, setErros] = useState<Record<string, string[]>>({});

    function irParaListagem() {
        router.visit(route("aplicacao.empresa.promocoes.index", { cnpj }));
    }

    async function salvar(dados: IPromocaoFormData) {
        setSalvando(true);
        setErros({});

        await axios
            .post(
                route("aplicacao.empresa.promocoes.edicao.update", {
                    cnpj,
                    cupom_id: cupomId,
                }),
                dados,
            )
            .then((response) => {
                toast.success(response.data.mensagem);
                irParaListagem();
            })
            .catch((error) => {
                if (error.response?.status === 422) {
                    setErros(error.response.data.errors ?? {});
                    toast.error(
                        "Existem campos com erros. Revise o formulário.",
                    );
                } else {
                    toast.error(
                        error.response?.data?.message ??
                            "Não foi possível salvar as alterações",
                    );
                }
            })
            .finally(() => setSalvando(false));
    }

    return (
        <LayoutAutenticado>
            <FormularioPromocao
                titulo={`Editar Cupom: ${promocao.nome_cupom}`}
                subtitulo="Atualize as informações do cupom promocional"
                valoresIniciais={promocao}
                aoSalvar={salvar}
                aoCancelar={irParaListagem}
                labelBotaoFinal="Salvar Alterações"
                salvando={salvando}
                erros={erros}
            />
        </LayoutAutenticado>
    );
}
