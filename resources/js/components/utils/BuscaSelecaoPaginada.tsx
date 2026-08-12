import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Images, Link, Plus, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export interface IComplementoBuscaSelecionavel {
    id: number;
    nome: string;
    descricao?: string | null;
    imagem?: string | null;
}

export interface IRespostaPaginada<T> {
    data: T[];
    current_page: number;
    last_page: number;
}

interface IProps<T extends IComplementoBuscaSelecionavel> {
    titulo: string;
    placeholder?: string;
    buscar: (params: { busca: string; page: number }) => Promise<IRespostaPaginada<T>>;
    onAdicionar: (itens: T[]) => void;
    fecharComponente: () => void;
    idsJaAdicionados?: number[];
}

export default function BuscaSelecaoPaginada<T extends IComplementoBuscaSelecionavel>({
    titulo,
    placeholder = "Escreva o nome do produto",
    buscar,
    onAdicionar,
    fecharComponente,
    idsJaAdicionados = [],
}: IProps<T>) {
    const [busca, setBusca] = useState("");
    const [pagina, setPagina] = useState(1);
    const [resultado, setResultado] = useState<IRespostaPaginada<T>>({ data: [], current_page: 1, last_page: 1 });
    const [carregando, setCarregando] = useState(false);
    const [selecionados, setSelecionados] = useState<T[]>([]);

    useEffect(() => {
        setPagina(1);
    }, [busca]);

    useEffect(() => {
        let cancelado = false;
        setCarregando(true);

        const timeout = setTimeout(() => {
            buscar({ busca, page: pagina })
                .then((resposta) => {
                    if (cancelado) return;
                    setResultado(resposta);
                })
                .finally(() => {
                    if (!cancelado) setCarregando(false);
                });
        }, busca ? 400 : 0);

        return () => {
            cancelado = true;
            clearTimeout(timeout);
        };
    }, [busca, pagina]);

    function toggleSelecionado(item: T) {
        setSelecionados(prev => prev.some((c) => c.id === item.id)
            ? prev.filter((c) => c.id !== item.id)
            : [...prev, item]
        );
    }

    function adicionarSelecionados() {
        onAdicionar(selecionados);
        setSelecionados([]);
    }

    const idsSelecionados = selecionados.map((item) => item.id);

    return (
        <Card className="m-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Link className="size-4" />
                    {titulo}
                </CardTitle>
                {selecionados.length > 0 && (
                    <CardAction>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setSelecionados([])}
                        >
                            <Trash2 />
                        </Button>
                    </CardAction>
                )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <InputGroup className="rounded-full">
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder={placeholder}
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </InputGroup>

                <div className="flex flex-col gap-4">
                    {carregando ? (
                        <div className="flex justify-center py-6">
                            <Spinner />
                        </div>
                    ) : resultado.data.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
                    ) : (
                        resultado.data.map((item) => (
                            <label key={item.id} className={cn("flex items-center gap-3", idsJaAdicionados.includes(item.id) ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
                                <Checkbox
                                    checked={idsSelecionados.includes(item.id) || idsJaAdicionados.includes(item.id)}
                                    disabled={idsJaAdicionados.includes(item.id)}
                                    onCheckedChange={() => toggleSelecionado(item)}
                                />
                                {item.imagem ? (
                                    <img
                                        src={item.imagem}
                                        alt={item.nome}
                                        className="size-12 shrink-0 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex justify-center items-center size-12 shrink-0 rounded-lg bg-muted">
                                        <Images />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="font-medium">{item.nome}</span>
                                    {item.descricao && (
                                        <span className="text-sm text-muted-foreground">{item.descricao}</span>
                                    )}
                                </div>
                            </label>
                        ))
                    )}
                </div>

                {resultado.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={pagina <= 1}
                            onClick={() => setPagina((p) => p - 1)}
                        >
                            <ChevronLeft />
                        </Button>
                        {Array.from({ length: resultado.last_page }, (_, i) => i + 1).map((p) => (
                            <Button
                                key={p}
                                type="button"
                                variant={p === pagina ? "default" : "ghost"}
                                size="icon"
                                className="rounded-full"
                                onClick={() => setPagina(p)}
                            >
                                {p}
                            </Button>
                        ))}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={pagina >= resultado.last_page}
                            onClick={() => setPagina((p) => p + 1)}
                        >
                            <ChevronRight />
                        </Button>
                    </div>
                )}
            </CardContent>
                <CardFooter className="justify-end gap-2">
                <Button variant={'destructive'} onClick={() => fecharComponente()}>Cancelar</Button>
                {selecionados.length > 0 && (
                        <Button type="button" onClick={adicionarSelecionados}>
                            <Plus />
                            Adicionar {selecionados.length} complemento{selecionados.length > 1 ? 's' : ''}
                        </Button>
                )}
            </CardFooter>
        </Card>
    );
}
