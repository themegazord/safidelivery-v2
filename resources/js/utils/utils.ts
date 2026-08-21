import axios from "axios";

// Instância isolada: o axios padrão ganha um interceptor global do Laravel Echo que injeta o
// header X-Socket-Id em toda requisição (usado para excluir o remetente de broadcasts). APIs de
// terceiros como o ViaCEP não liberam esse header no CORS e bloqueiam a chamada inteira por causa
// dele — então chamadas externas precisam de uma instância própria, sem esse interceptor.
const axiosExterno = axios.create();

type TCEP = {
    logradouro: string,
    numero: string,
    complemento: string,
    bairro: string,
    cidade: string,
    uf: string | null
}

export function converteReal(valor?: number | string) {
    const num =
        typeof valor === "string"
            ? parseFloat(valor.replace(",", "."))
            : Number(valor);
    return num.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export async function consultaCEP(cep: string): Promise<TCEP | null> {
    const { data: resposta } = await axiosExterno.get(`https://viacep.com.br/ws/${cep}/json/`);

    if (resposta.erro) {
        return null;
    }

    return {
        logradouro: resposta.logradouro,
        numero: resposta.numero,
        complemento: resposta.complemento,
        bairro: resposta.bairro,
        cidade: resposta.localidade,
        uf: resposta.uf,
    };
}