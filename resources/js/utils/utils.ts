import axios from "axios";

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
    const { data: resposta } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

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