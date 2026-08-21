import { useEffect, useRef, useState } from "react";
import { Form, useFormContext, usePage } from "@inertiajs/react";
import type { MaskitoOptions } from "@maskito/core";
import { useMaskito } from "@maskito/react";
import { toast } from "sonner";
import {
    Hash,
    House,
    ImagePlus,
    Loader,
    Map,
    MapPin,
    Store,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import { ESTADOS } from "@/utils/estados";
import { consultaCEP } from "@/utils/utils";

type LojaProps = {
    loja: {
        razao_social: string;
        nome_fantasia: string;
        cnpj: string;
        email: string;
        logo: string | null;
        capa: string | null;
        cep: string;
        logradouro: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        uf: string;
    };
};

type LojaFormData = {
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
    email: string;
    logo: File | null;
    capa: File | null;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
};

type Errors = Partial<Record<keyof LojaFormData, string>>;

const CEPMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/],
};

const CNPJMask: MaskitoOptions = {
    mask: [
        /\d/, /\d/, ".",
        /\d/, /\d/, /\d/, ".",
        /\d/, /\d/, /\d/, "/",
        /\d/, /\d/, /\d/, /\d/, "-",
        /\d/, /\d/,
    ],
};

function usePreview(urlAtual: string | null) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    function seleciona(file: File | null) {
        setPreview((atual) => {
            if (atual) URL.revokeObjectURL(atual);
            return file ? URL.createObjectURL(file) : null;
        });
    }

    return { inputRef, url: preview ?? urlAtual, seleciona };
}

type CampoMarcaProps = {
    logoAtual: string | null;
    capaAtual: string | null;
    nome: string;
    errors: Errors;
};

function CampoMarca({ logoAtual, capaAtual, nome, errors }: CampoMarcaProps) {
    const logo = usePreview(logoAtual);
    const capa = usePreview(capaAtual);

    return (
        <div className="space-y-4">
            <div className="relative">
                {/* Capa */}
                <button
                    type="button"
                    onClick={() => capa.inputRef.current?.click()}
                    aria-label="Alterar capa da loja"
                    className="group relative block aspect-[4/1] w-full overflow-hidden rounded-lg border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                    {capa.url ? (
                        <img
                            src={capa.url}
                            alt=""
                            className="size-full object-cover"
                        />
                    ) : (
                        <span className="flex size-full items-center justify-center gap-2 text-sm text-muted-foreground">
                            <ImagePlus className="size-4" />
                            Adicionar capa
                        </span>
                    )}
                    <span className="absolute inset-0 hidden items-center justify-center bg-black/50 text-sm font-medium text-white group-hover:flex">
                        Trocar capa
                    </span>
                </button>

                {/* Logo sobreposta */}
                <button
                    type="button"
                    onClick={() => logo.inputRef.current?.click()}
                    aria-label="Alterar logo da loja"
                    className="group absolute -bottom-6 left-6 size-24 overflow-hidden rounded-xl border-4 border-background bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {logo.url ? (
                        <img
                            src={logo.url}
                            alt=""
                            className="size-full object-cover"
                        />
                    ) : (
                        <span className="flex size-full items-center justify-center">
                            <ImagePlus className="size-5 text-muted-foreground" />
                        </span>
                    )}
                    <span className="absolute inset-0 hidden items-center justify-center bg-black/50 text-xs font-medium text-white group-hover:flex">
                        Trocar
                    </span>
                </button>
            </div>

            <div className="pl-32 pt-1">
                <p className="text-sm font-medium">{nome || "Sua loja"}</p>
                <p className="text-xs text-muted-foreground">
                    É assim que sua loja aparece para o cliente. JPEG — capa em
                    1200x300, logo quadrada a partir de 200x200.
                </p>
            </div>

            <input
                ref={logo.inputRef}
                id="logo"
                name="logo"
                type="file"
                accept="image/jpeg"
                className="sr-only"
                onChange={(e) => logo.seleciona(e.target.files?.[0] ?? null)}
            />
            <input
                ref={capa.inputRef}
                id="capa"
                name="capa"
                type="file"
                accept="image/jpeg"
                className="sr-only"
                onChange={(e) => capa.seleciona(e.target.files?.[0] ?? null)}
            />

            {(errors.logo || errors.capa) && (
                <div className="space-y-1">
                    {errors.logo && <FieldError>{errors.logo}</FieldError>}
                    {errors.capa && <FieldError>{errors.capa}</FieldError>}
                </div>
            )}
        </div>
    );
}

type CamposEnderecoProps = {
    endereco: LojaProps["loja"];
    errors: Errors;
};

function CamposEndereco({ endereco, errors }: CamposEnderecoProps) {
    const form = useFormContext<LojaFormData>();
    const [loadingCEP, setLoadingCEP] = useState(false);
    const [dados, setDados] = useState({
        cep: endereco.cep,
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        uf: endereco.uf,
    });
    const CEPMaskRef = useMaskito({ options: CEPMask });

    async function buscaCEP() {
        const cepLimpo = dados.cep.replace(/\D/g, "");

        form?.clearErrors("cep");

        if (cepLimpo.length !== 8) {
            form?.setError("cep", "Informe um CEP com 8 dígitos.");
            return;
        }

        try {
            setLoadingCEP(true);
            const encontrado = await consultaCEP(cepLimpo);

            if (!encontrado) {
                form?.setError(
                    "cep",
                    "CEP não encontrado. Confira os números ou preencha o endereço manualmente.",
                );
                return;
            }

            setDados((atual) => ({
                ...atual,
                logradouro: encontrado.logradouro,
                numero: encontrado.numero || atual.numero,
                complemento: encontrado.complemento || atual.complemento,
                bairro: encontrado.bairro,
                cidade: encontrado.cidade,
                uf: encontrado.uf ?? atual.uf,
            }));
        } catch {
            toast.error("Não foi possível consultar o CEP. Tente novamente ou preencha o endereço manualmente.");
        } finally {
            setLoadingCEP(false);
        }
    }

    return (
        <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-3">
                <Field data-invalid={!!errors.cep}>
                    <FieldLabel htmlFor="cep">CEP</FieldLabel>
                    <InputGroup>
                        <InputGroupInput
                            ref={CEPMaskRef}
                            id="cep"
                            name="cep"
                            placeholder="00000-000"
                            aria-invalid={!!errors.cep}
                            defaultValue={dados.cep}
                            onBlur={(e) =>
                                setDados((atual) => ({
                                    ...atual,
                                    cep: e.currentTarget.value,
                                }))
                            }
                        />
                        <InputGroupAddon>
                            <MapPin />
                        </InputGroupAddon>
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                type="button"
                                onClick={() => buscaCEP()}
                                disabled={loadingCEP}
                            >
                                {loadingCEP ? (
                                    <Loader className="animate-spin" />
                                ) : (
                                    "Buscar"
                                )}
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                    {errors.cep ? (
                        <FieldError>{errors.cep}</FieldError>
                    ) : (
                        <FieldDescription>
                            Preenche o resto automaticamente.
                        </FieldDescription>
                    )}
                </Field>

                <Field
                    className="sm:col-span-2"
                    data-invalid={!!errors.logradouro}
                >
                    <FieldLabel htmlFor="logradouro">Logradouro</FieldLabel>
                    <InputGroup>
                        <InputGroupInput
                            id="logradouro"
                            name="logradouro"
                            aria-invalid={!!errors.logradouro}
                            value={dados.logradouro}
                            onChange={(e) =>
                                setDados((atual) => ({
                                    ...atual,
                                    logradouro: e.target.value,
                                }))
                            }
                        />
                        <InputGroupAddon>
                            <House />
                        </InputGroupAddon>
                    </InputGroup>
                    {errors.logradouro && (
                        <FieldError>{errors.logradouro}</FieldError>
                    )}
                </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Field data-invalid={!!errors.numero}>
                    <FieldLabel htmlFor="numero">Número</FieldLabel>
                    <InputGroup>
                        <InputGroupInput
                            id="numero"
                            name="numero"
                            aria-invalid={!!errors.numero}
                            value={dados.numero}
                            onChange={(e) =>
                                setDados((atual) => ({
                                    ...atual,
                                    numero: e.target.value,
                                }))
                            }
                        />
                        <InputGroupAddon>
                            <Hash />
                        </InputGroupAddon>
                    </InputGroup>
                    {errors.numero && <FieldError>{errors.numero}</FieldError>}
                </Field>

                <Field
                    className="sm:col-span-2"
                    data-invalid={!!errors.complemento}
                >
                    <FieldLabel htmlFor="complemento">Complemento</FieldLabel>
                    <Input
                        id="complemento"
                        name="complemento"
                        placeholder="Sala, bloco, ponto de referência"
                        aria-invalid={!!errors.complemento}
                        value={dados.complemento}
                        onChange={(e) =>
                            setDados((atual) => ({
                                ...atual,
                                complemento: e.target.value,
                            }))
                        }
                    />
                    {errors.complemento && (
                        <FieldError>{errors.complemento}</FieldError>
                    )}
                </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Field data-invalid={!!errors.bairro}>
                    <FieldLabel htmlFor="bairro">Bairro</FieldLabel>
                    <InputGroup>
                        <InputGroupInput
                            id="bairro"
                            name="bairro"
                            aria-invalid={!!errors.bairro}
                            value={dados.bairro}
                            onChange={(e) =>
                                setDados((atual) => ({
                                    ...atual,
                                    bairro: e.target.value,
                                }))
                            }
                        />
                        <InputGroupAddon>
                            <Map />
                        </InputGroupAddon>
                    </InputGroup>
                    {errors.bairro && <FieldError>{errors.bairro}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.cidade}>
                    <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
                    <InputGroup>
                        <InputGroupInput
                            id="cidade"
                            name="cidade"
                            aria-invalid={!!errors.cidade}
                            value={dados.cidade}
                            onChange={(e) =>
                                setDados((atual) => ({
                                    ...atual,
                                    cidade: e.target.value,
                                }))
                            }
                        />
                        <InputGroupAddon>
                            <Store />
                        </InputGroupAddon>
                    </InputGroup>
                    {errors.cidade && <FieldError>{errors.cidade}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.uf}>
                    <FieldLabel htmlFor="uf">Estado</FieldLabel>
                    <Select
                        name="uf"
                        value={dados.uf || undefined}
                        onValueChange={(value) =>
                            setDados((atual) => ({ ...atual, uf: value ?? atual.uf }))
                        }
                    >
                        <SelectTrigger
                            id="uf"
                            aria-invalid={!!errors.uf}
                            className="w-full"
                        >
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {ESTADOS.filter((e) => e.value !== undefined).map(
                                ({ value, label }) => (
                                    <SelectItem
                                        key={value}
                                        value={value as string}
                                    >
                                        {label}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                    {errors.uf && <FieldError>{errors.uf}</FieldError>}
                </Field>
            </div>
        </FieldGroup>
    );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function Loja({ loja }: LojaProps) {
    const { cnpj } = usePage<{ cnpj: string }>().props;
    const CNPJMaskRef = useMaskito({ options: CNPJMask });

    return (
        <LayoutAutenticado>
            <div className="mx-auto w-full max-w-3xl px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Sua loja
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Dados cadastrais e identidade visual que aparecem para
                        seus clientes.
                    </p>
                </header>

                <Form<LojaFormData>
                    action={route("aplicacao.empresa.configempresa.loja.update", {
                        cnpj,
                    })}
                    method="post"
                    transform={(data) => ({
                        ...data,
                        cnpj: String(data.cnpj ?? "").replace(/\D/g, ""),
                        cep: String(data.cep ?? "").replace(/\D/g, ""),
                    })}
                    onSuccess={() =>
                        toast.success("Dados da loja atualizados com sucesso!")
                    }
                >
                    {({ processing, errors }) => (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Identidade visual</CardTitle>
                                    <CardDescription>
                                        Capa e logo exibidas no topo do seu
                                        cardápio.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CampoMarca
                                        logoAtual={loja.logo}
                                        capaAtual={loja.capa}
                                        nome={loja.nome_fantasia}
                                        errors={errors}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Dados da empresa</CardTitle>
                                    <CardDescription>
                                        Usados nos documentos e na comunicação
                                        com o cliente.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FieldGroup>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field
                                                data-invalid={!!errors.razao_social}
                                            >
                                                <FieldLabel htmlFor="razao_social">
                                                    Razão social
                                                </FieldLabel>
                                                <Input
                                                    id="razao_social"
                                                    name="razao_social"
                                                    aria-invalid={
                                                        !!errors.razao_social
                                                    }
                                                    defaultValue={
                                                        loja.razao_social
                                                    }
                                                />
                                                {errors.razao_social && (
                                                    <FieldError>
                                                        {errors.razao_social}
                                                    </FieldError>
                                                )}
                                            </Field>

                                            <Field
                                                data-invalid={!!errors.nome_fantasia}
                                            >
                                                <FieldLabel htmlFor="nome_fantasia">
                                                    Nome fantasia
                                                </FieldLabel>
                                                <Input
                                                    id="nome_fantasia"
                                                    name="nome_fantasia"
                                                    aria-invalid={
                                                        !!errors.nome_fantasia
                                                    }
                                                    defaultValue={
                                                        loja.nome_fantasia
                                                    }
                                                />
                                                <FieldDescription>
                                                    Nome que o cliente vê.
                                                </FieldDescription>
                                                {errors.nome_fantasia && (
                                                    <FieldError>
                                                        {errors.nome_fantasia}
                                                    </FieldError>
                                                )}
                                            </Field>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field data-invalid={!!errors.cnpj}>
                                                <FieldLabel htmlFor="cnpj">
                                                    CNPJ
                                                </FieldLabel>
                                                <Input
                                                    ref={CNPJMaskRef}
                                                    id="cnpj"
                                                    name="cnpj"
                                                    inputMode="numeric"
                                                    placeholder="00.000.000/0000-00"
                                                    aria-invalid={!!errors.cnpj}
                                                    defaultValue={loja.cnpj}
                                                />
                                                {errors.cnpj && (
                                                    <FieldError>
                                                        {errors.cnpj}
                                                    </FieldError>
                                                )}
                                            </Field>

                                            <Field data-invalid={!!errors.email}>
                                                <FieldLabel htmlFor="email">
                                                    Email
                                                </FieldLabel>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    aria-invalid={!!errors.email}
                                                    defaultValue={loja.email}
                                                />
                                                <FieldDescription>
                                                    Também é o login do sistema.
                                                </FieldDescription>
                                                {errors.email && (
                                                    <FieldError>
                                                        {errors.email}
                                                    </FieldError>
                                                )}
                                            </Field>
                                        </div>
                                    </FieldGroup>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Endereço</CardTitle>
                                    <CardDescription>
                                        Base para o cálculo das taxas de
                                        entrega.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CamposEndereco
                                        endereco={loja}
                                        errors={errors}
                                    />
                                </CardContent>
                            </Card>

                            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-background/80 py-4 backdrop-blur">
                                <Button type="submit" disabled={processing}>
                                    {processing && (
                                        <Loader className="animate-spin" />
                                    )}
                                    {processing
                                        ? "Salvando..."
                                        : "Salvar alterações"}
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </div>
        </LayoutAutenticado>
    );
}