import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
import FormularioPromocao from "@/components/Empresa/Promocoes/FormularioPromocao";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import {
    IPromocaoFormData,
    PROMOCAO_FORM_PADRAO,
} from "@/types/empresa/promocoes/types";

export default function CadastroPromocao() {
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
                route("aplicacao.empresa.promocoes.cadastro.store", { cnpj }),
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
                            "Não foi possível cadastrar o cupom",
                    );
                }
            })
            .finally(() => setSalvando(false));
    }

    return (
        <LayoutAutenticado>
            <FormularioPromocao
                titulo="Novo Cupom"
                subtitulo="Crie cupons promocionais para seus clientes"
                valoresIniciais={PROMOCAO_FORM_PADRAO}
                aoSalvar={salvar}
                aoCancelar={irParaListagem}
                labelBotaoFinal="Criar Cupom"
                salvando={salvando}
                erros={erros}
            />
        </LayoutAutenticado>
    );
}
