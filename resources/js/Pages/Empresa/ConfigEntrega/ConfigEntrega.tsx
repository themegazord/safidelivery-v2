import { useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import { converteReal } from "@/utils/utils";
import {
    TConfiguracoesGeraisEntrega,
    TCoordenada,
    TEmpresaCoordenadas,
    TTaxaEntrega,
} from "@/types/empresa/configentrega/types";
import MapaEntregaEditor, {
    MapaEntregaEditorRef,
} from "@/components/Empresa/ConfigEntrega/MapaEntregaEditor";
import { CircleDashed, MapPin, MapPinned, Pencil, Plus, Trash2 } from "lucide-react";

interface IProps {
    empresa: TEmpresaCoordenadas;
    taxasPorRaio: TTaxaEntrega[];
    configuracoesGerais: TConfiguracoesGeraisEntrega;
    googleMapsApiKey: string;
    googleMapsMapId: string;
}

const NOVA_TAXA_PADRAO = {
    raio: 0,
    tempo: 0,
    taxa: 0,
    corCirculo: "#000000",
    corPreenchimento: "#000000",
};

export default function ConfigEntrega({
    empresa,
    taxasPorRaio,
    configuracoesGerais,
    googleMapsApiKey,
    googleMapsMapId,
}: IProps) {
    const { cnpj } = usePage<{ cnpj: string }>().props;
    const mapaRef = useRef<MapaEntregaEditorRef>(null);

    const [configGeral, setConfigGeral] = useState<TConfiguracoesGeraisEntrega>(configuracoesGerais);
    const [salvandoGeral, setSalvandoGeral] = useState(false);

    const [taxas, setTaxas] = useState<TTaxaEntrega[]>(taxasPorRaio);
    const [salvandoTaxas, setSalvandoTaxas] = useState(false);

    const [modoDesenho, setModoDesenhoState] = useState<"raio" | "poligono">("raio");
    const [poligonoTemporario, setPoligonoTemporario] = useState<TCoordenada[] | null>(null);
    const [novaTaxa, setNovaTaxa] = useState(NOVA_TAXA_PADRAO);

    function atualizaConfigGeral<K extends keyof TConfiguracoesGeraisEntrega>(
        campo: K,
        valor: TConfiguracoesGeraisEntrega[K],
    ) {
        setConfigGeral((atual) => ({ ...atual, [campo]: valor }));
    }

    async function salvarConfiguracoesGerais() {
        setSalvandoGeral(true);
        await axios
            .post(route("aplicacao.empresa.configentrega.geral", { cnpj }), configGeral)
            .then((response) => toast.success(response.data.mensagem))
            .catch((error) =>
                toast.error(error.response?.data?.message ?? "Não foi possível salvar as configurações"),
            )
            .finally(() => setSalvandoGeral(false));
    }

    function alterarModoDesenho(modo: "raio" | "poligono") {
        setModoDesenhoState(modo);
        setPoligonoTemporario(null);
        mapaRef.current?.cancelarDesenho();
    }

    function ativarDesenhoPoligono() {
        mapaRef.current?.iniciarDesenhoPoligono();
    }

    function adicionaTaxa() {
        if (modoDesenho === "poligono") {
            if (!poligonoTemporario) {
                toast.warning("Desenhe um polígono no mapa primeiro.");
                return;
            }

            const novaZona: TTaxaEntrega = {
                tipo: "poligono",
                raio: 0,
                tempo: novaTaxa.tempo,
                taxa: novaTaxa.taxa,
                corCirculo: novaTaxa.corCirculo,
                corPreenchimento: novaTaxa.corPreenchimento,
                coordenadas: poligonoTemporario,
            };

            setTaxas((atual) => [...atual, novaZona]);
            setPoligonoTemporario(null);
            mapaRef.current?.confirmarPoligono();
        } else {
            const novaZona: TTaxaEntrega = {
                tipo: "raio",
                raio: novaTaxa.raio,
                tempo: novaTaxa.tempo,
                taxa: novaTaxa.taxa,
                corCirculo: novaTaxa.corCirculo,
                corPreenchimento: novaTaxa.corPreenchimento,
                coordenadas: null,
            };

            setTaxas((atual) =>
                [...atual, novaZona].sort((a, b) =>
                    a.tipo === "raio" && b.tipo === "raio" ? a.raio - b.raio : 0,
                ),
            );
        }

        setNovaTaxa(NOVA_TAXA_PADRAO);
    }

    function removeTaxa(index: number) {
        setTaxas((atual) => atual.filter((_, i) => i !== index));
    }

    async function salvarTaxas() {
        setSalvandoTaxas(true);
        await axios
            .post(route("aplicacao.empresa.configentrega.taxas", { cnpj }), { taxas })
            .then((response) => toast.success(response.data.mensagem))
            .catch((error) =>
                toast.error(error.response?.data?.message ?? "Não foi possível salvar as taxas"),
            )
            .finally(() => setSalvandoTaxas(false));
    }

    return (
        <LayoutAutenticado>
            <div className="space-y-6">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight">Configurações de entrega</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Defina os raios de entrega, tempo estimado e taxas cobradas por distância.
                    </p>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Regras gerais de entrega</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Field>
                                <FieldLabel htmlFor="taxa_fixa">Taxa fixa de entrega</FieldLabel>
                                <Input
                                    id="taxa_fixa"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder="Deixe vazio para usar raios"
                                    value={configGeral.taxa_fixa ?? ""}
                                    onChange={(e) =>
                                        atualizaConfigGeral(
                                            "taxa_fixa",
                                            e.target.value === "" ? null : Number(e.target.value),
                                        )
                                    }
                                />
                                <FieldDescription>Cobra esse valor independente da distância.</FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="valor_minimo_pedido">Valor mínimo do pedido</FieldLabel>
                                <Input
                                    id="valor_minimo_pedido"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder="Sem mínimo"
                                    value={configGeral.valor_minimo_pedido ?? ""}
                                    onChange={(e) =>
                                        atualizaConfigGeral(
                                            "valor_minimo_pedido",
                                            e.target.value === "" ? null : Number(e.target.value),
                                        )
                                    }
                                />
                                <FieldDescription>Pedidos abaixo desse valor são recusados.</FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="frete_gratis_acima">Frete grátis acima de</FieldLabel>
                                <Input
                                    id="frete_gratis_acima"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder="Sem frete grátis"
                                    value={configGeral.frete_gratis_acima ?? ""}
                                    onChange={(e) =>
                                        atualizaConfigGeral(
                                            "frete_gratis_acima",
                                            e.target.value === "" ? null : Number(e.target.value),
                                        )
                                    }
                                />
                                <FieldDescription>Aplica frete grátis automaticamente.</FieldDescription>
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel>
                                Prioridade quando endereço está dentro de um raio e de um polígono simultaneamente
                            </FieldLabel>
                            <RadioGroup
                                value={configGeral.prioridade_zona_sobreposicao}
                                onValueChange={(value) =>
                                    atualizaConfigGeral(
                                        "prioridade_zona_sobreposicao",
                                        value as TConfiguracoesGeraisEntrega["prioridade_zona_sobreposicao"],
                                    )
                                }
                                className="grid gap-3 sm:grid-cols-2"
                            >
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                    <RadioGroupItem value="poligono" />
                                    <div>
                                        <p className="text-sm font-medium">Usar taxa do polígono</p>
                                        <p className="text-xs text-muted-foreground">O polígono prevalece sobre o raio</p>
                                    </div>
                                </label>
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5">
                                    <RadioGroupItem value="raio" />
                                    <div>
                                        <p className="text-sm font-medium">Usar taxa do raio</p>
                                        <p className="text-xs text-muted-foreground">O raio prevalece sobre o polígono</p>
                                    </div>
                                </label>
                            </RadioGroup>
                        </Field>

                        <div className="flex justify-end">
                            <Button onClick={salvarConfiguracoesGerais} disabled={salvandoGeral}>
                                {salvandoGeral ? (
                                    <>
                                        <Spinner /> Salvando...
                                    </>
                                ) : (
                                    "Salvar configurações"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Nova faixa de entrega</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex rounded-xl border p-1">
                                    <button
                                        type="button"
                                        onClick={() => alterarModoDesenho("raio")}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${
                                            modoDesenho === "raio"
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        <CircleDashed className="h-4 w-4" /> Raio
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => alterarModoDesenho("poligono")}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${
                                            modoDesenho === "poligono"
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        <MapPin className="h-4 w-4" /> Polígono
                                    </button>
                                </div>

                                {modoDesenho === "raio" ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel htmlFor="raio">Raio</FieldLabel>
                                            <Input
                                                id="raio"
                                                type="number"
                                                min={0}
                                                placeholder="Ex: 3"
                                                value={novaTaxa.raio}
                                                onChange={(e) =>
                                                    setNovaTaxa((atual) => ({ ...atual, raio: Number(e.target.value) }))
                                                }
                                            />
                                            <FieldDescription>Em km</FieldDescription>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="tempo-raio">Tempo estimado</FieldLabel>
                                            <Input
                                                id="tempo-raio"
                                                type="number"
                                                min={0}
                                                placeholder="Ex: 30"
                                                value={novaTaxa.tempo}
                                                onChange={(e) =>
                                                    setNovaTaxa((atual) => ({ ...atual, tempo: Number(e.target.value) }))
                                                }
                                            />
                                            <FieldDescription>Em minutos</FieldDescription>
                                        </Field>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Field>
                                            <FieldLabel htmlFor="tempo-poligono">Tempo estimado</FieldLabel>
                                            <Input
                                                id="tempo-poligono"
                                                type="number"
                                                min={0}
                                                placeholder="Ex: 30"
                                                value={novaTaxa.tempo}
                                                onChange={(e) =>
                                                    setNovaTaxa((atual) => ({ ...atual, tempo: Number(e.target.value) }))
                                                }
                                            />
                                            <FieldDescription>Em minutos</FieldDescription>
                                        </Field>

                                        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                                            {poligonoTemporario ? (
                                                <p className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                                                    <MapPinned className="h-4 w-4" />
                                                    Polígono desenhado ({poligonoTemporario.length} vértices). Defina os valores abaixo e clique em Adicionar.
                                                </p>
                                            ) : (
                                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <MapPinned className="h-4 w-4 text-primary" />
                                                    Clique em <strong>Desenhar zona</strong> no mapa e trace o polígono clicando nos vértices. Dê duplo clique para finalizar.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Field>
                                    <FieldLabel htmlFor="taxa">Taxa de entrega (R$)</FieldLabel>
                                    <Input
                                        id="taxa"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        placeholder="0,00"
                                        value={novaTaxa.taxa}
                                        onChange={(e) =>
                                            setNovaTaxa((atual) => ({ ...atual, taxa: Number(e.target.value) }))
                                        }
                                    />
                                </Field>

                                <div className="grid grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="corCirculo">Cor da borda</FieldLabel>
                                        <Input
                                            id="corCirculo"
                                            type="color"
                                            className="h-9 cursor-pointer p-1"
                                            value={novaTaxa.corCirculo}
                                            onChange={(e) =>
                                                setNovaTaxa((atual) => ({ ...atual, corCirculo: e.target.value }))
                                            }
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="corPreenchimento">Cor do preenchimento</FieldLabel>
                                        <Input
                                            id="corPreenchimento"
                                            type="color"
                                            className="h-9 cursor-pointer p-1"
                                            value={novaTaxa.corPreenchimento}
                                            onChange={(e) =>
                                                setNovaTaxa((atual) => ({ ...atual, corPreenchimento: e.target.value }))
                                            }
                                        />
                                    </Field>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {modoDesenho === "poligono" && (
                                        <Button type="button" variant="outline" onClick={ativarDesenhoPoligono}>
                                            <Pencil /> Desenhar zona no mapa
                                        </Button>
                                    )}
                                    <Button type="button" onClick={adicionaTaxa}>
                                        <Plus /> Adicionar faixa
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Faixas cadastradas</CardTitle>
                                    <CardDescription>{taxas.length} faixa(s) configurada(s)</CardDescription>
                                </div>
                                <Button size="sm" onClick={salvarTaxas} disabled={salvandoTaxas}>
                                    {salvandoTaxas ? <Spinner /> : "Salvar"}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {taxas.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground/60">
                                        <MapPin className="h-8 w-8" />
                                        <p className="text-sm">Nenhuma faixa cadastrada</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col divide-y">
                                        {taxas.map((tx, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="h-8 w-8 shrink-0 rounded-full"
                                                        style={{
                                                            backgroundColor: tx.corPreenchimento,
                                                            border: `2px solid ${tx.corCirculo}`,
                                                        }}
                                                    />
                                                    <div>
                                                        {tx.tipo === "poligono" ? (
                                                            <p className="flex items-center gap-1 font-semibold">
                                                                <MapPin className="h-3.5 w-3.5 text-secondary-foreground" /> Polígono
                                                            </p>
                                                        ) : (
                                                            <p className="font-semibold">Até {tx.raio} km</p>
                                                        )}
                                                        <p className="text-sm text-muted-foreground">
                                                            {tx.tempo} min · R$ {converteReal(tx.taxa)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTaxa(idx)}
                                                    aria-label="Remover faixa"
                                                >
                                                    <Trash2 className="h-5 w-5 cursor-pointer text-destructive" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <MapaEntregaEditor
                        ref={mapaRef}
                        latitude={empresa.latitude}
                        longitude={empresa.longitude}
                        nomeFantasia={empresa.nome_fantasia}
                        apiKey={googleMapsApiKey}
                        mapId={googleMapsMapId}
                        taxas={taxas}
                        onPoligonoDesenhado={setPoligonoTemporario}
                        onAviso={(mensagem) => toast.warning(mensagem)}
                    />
                </div>
            </div>
        </LayoutAutenticado>
    );
}
