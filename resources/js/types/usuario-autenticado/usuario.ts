export interface IEndereco {
    id: number;
    logradouro: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    numero: number;
    complemento: string;
    created_at: string;
    updated_at: string;
    pivot: {
        cliente_id: number;
        endereco_id: number;
    };
}

export interface ICliente {
    id: number;
    user_id: number;
    nome: string;
    email: string | null;
    cpf_cnpj: string | null;
    telefone: string;
    data_nascimento: string | null;
    created_at: string;
    updated_at: string;
    enderecos: IEndereco[];
}

export interface IUsuario {
    id: number;
    name: string;
    email?: string | null;
    email_verified_at?: string | null;
    created_at: string;
    updated_at: string;
    cliente: ICliente;
}
