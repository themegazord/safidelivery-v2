import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { Spinner } from "@/components/ui/spinner";
import { carregarGoogleMaps } from "@/utils/googleMaps";
import { TCoordenada, TTaxaEntrega } from "@/types/empresa/configentrega/types";

export interface MapaEntregaEditorRef {
    iniciarDesenhoPoligono: () => void;
    cancelarDesenho: () => void;
    confirmarPoligono: () => void;
}

interface IProps {
    latitude: number | null;
    longitude: number | null;
    nomeFantasia: string;
    apiKey: string;
    mapId: string;
    taxas: TTaxaEntrega[];
    onPoligonoDesenhado: (coordenadas: TCoordenada[]) => void;
    onAviso?: (mensagem: string) => void;
}

const MapaEntregaEditor = forwardRef<MapaEntregaEditorRef, IProps>(
    function MapaEntregaEditor(
        { latitude, longitude, nomeFantasia, apiKey, mapId, taxas, onPoligonoDesenhado, onAviso },
        ref,
    ) {
        const containerRef = useRef<HTMLDivElement>(null);
        const mapaRef = useRef<any>(null);
        const formasRef = useRef<any[]>([]);
        const poligonoTemporarioRef = useRef<any>(null);
        const caminhoTemporarioRef = useRef<any[]>([]);
        const verticesRef = useRef<any[]>([]);
        const desenhandoRef = useRef(false);
        const [carregando, setCarregando] = useState(true);
        const [erro, setErro] = useState<string | null>(null);

        function limpaVertices() {
            verticesRef.current.forEach((marcador) => {
                marcador.map = null;
            });
            verticesRef.current = [];
        }

        function criarConteudoVertice() {
            const ponto = document.createElement("div");
            ponto.style.width = "10px";
            ponto.style.height = "10px";
            ponto.style.borderRadius = "50%";
            ponto.style.backgroundColor = "#2563eb";
            ponto.style.border = "1px solid #ffffff";
            return ponto;
        }

        useEffect(() => {
            if (latitude === null || longitude === null) {
                setCarregando(false);
                setErro("Não foi possível localizar o endereço da empresa no mapa.");
                return;
            }

            let cancelado = false;

            carregarGoogleMaps(apiKey)
                .then(() => {
                    if (cancelado || !containerRef.current) return;

                    const mapa = new window.google.maps.Map(containerRef.current, {
                        center: { lat: latitude, lng: longitude },
                        zoom: 13,
                        mapId,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        rotateControl: false,
                        disableDoubleClickZoom: true,
                    });

                    new window.google.maps.marker.AdvancedMarkerElement({
                        position: { lat: latitude, lng: longitude },
                        map: mapa,
                        title: nomeFantasia,
                    });

                    // A DrawingManager foi removida da Maps JS API (v3.65+): desenhamos o
                    // polígono manualmente — clique adiciona vértice, duplo clique finaliza.
                    window.google.maps.event.addListener(mapa, "click", (evento: any) => {
                        if (!desenhandoRef.current || !poligonoTemporarioRef.current || !evento.latLng) return;
                        caminhoTemporarioRef.current.push(evento.latLng);
                        poligonoTemporarioRef.current.setPath(caminhoTemporarioRef.current);

                        // Um polígono com menos de 3 vértices quase não renderiza —
                        // marca cada clique com um ponto visível para dar feedback imediato.
                        const marcadorVertice = new window.google.maps.marker.AdvancedMarkerElement({
                            position: evento.latLng,
                            map: mapa,
                            content: criarConteudoVertice(),
                        });
                        verticesRef.current.push(marcadorVertice);
                    });

                    window.google.maps.event.addListener(mapa, "dblclick", () => {
                        if (!desenhandoRef.current || !poligonoTemporarioRef.current) return;

                        // remove o vértice duplicado gerado pelo segundo clique do duplo-clique
                        if (caminhoTemporarioRef.current.length > 1) caminhoTemporarioRef.current.pop();
                        if (verticesRef.current.length > 1) {
                            verticesRef.current.pop().map = null;
                        }
                        poligonoTemporarioRef.current.setPath(caminhoTemporarioRef.current);

                        if (caminhoTemporarioRef.current.length < 3) {
                            onAviso?.("Marque pelo menos 3 pontos no mapa antes de finalizar o polígono.");
                            return;
                        }

                        desenhandoRef.current = false;
                        limpaVertices();
                        const coordenadas: TCoordenada[] = caminhoTemporarioRef.current.map(
                            (ponto: any) => ({ lat: ponto.lat(), lng: ponto.lng() }),
                        );

                        onPoligonoDesenhado(coordenadas);
                    });

                    mapaRef.current = mapa;
                    setCarregando(false);
                })
                .catch((erro) => {
                    console.error("Falha ao inicializar o mapa de entrega", erro);
                    if (!cancelado) {
                        setErro("Não foi possível carregar o Google Maps.");
                        setCarregando(false);
                    }
                });

            return () => {
                cancelado = true;
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [latitude, longitude]);

        useEffect(() => {
            if (!mapaRef.current || latitude === null || longitude === null) return;

            formasRef.current.forEach((forma) => forma.setMap(null));
            formasRef.current = [];

            taxas.forEach((taxa) => {
                if (taxa.tipo === "poligono") {
                    if (!taxa.coordenadas || taxa.coordenadas.length === 0) return;
                    const poligono = new window.google.maps.Polygon({
                        map: mapaRef.current,
                        paths: taxa.coordenadas,
                        strokeColor: taxa.corCirculo,
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: taxa.corPreenchimento,
                        fillOpacity: 0.35,
                    });
                    formasRef.current.push(poligono);
                } else {
                    const circulo = new window.google.maps.Circle({
                        map: mapaRef.current,
                        center: { lat: latitude, lng: longitude },
                        radius: taxa.raio * 1000,
                        strokeColor: taxa.corCirculo,
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: taxa.corPreenchimento,
                        fillOpacity: 0.35,
                    });
                    formasRef.current.push(circulo);
                }
            });
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [taxas, latitude, longitude, carregando]);

        useImperativeHandle(ref, () => ({
            iniciarDesenhoPoligono() {
                if (!mapaRef.current) return;
                if (poligonoTemporarioRef.current) {
                    poligonoTemporarioRef.current.setMap(null);
                }
                limpaVertices();
                caminhoTemporarioRef.current = [];

                poligonoTemporarioRef.current = new window.google.maps.Polygon({
                    map: mapaRef.current,
                    paths: [],
                    strokeColor: "#2563eb",
                    strokeWeight: 2,
                    fillColor: "#2563eb",
                    fillOpacity: 0.35,
                    editable: false,
                    draggable: false,
                    clickable: false,
                });
                desenhandoRef.current = true;
            },
            cancelarDesenho() {
                desenhandoRef.current = false;
                limpaVertices();
                caminhoTemporarioRef.current = [];
                if (poligonoTemporarioRef.current) {
                    poligonoTemporarioRef.current.setMap(null);
                    poligonoTemporarioRef.current = null;
                }
            },
            confirmarPoligono() {
                desenhandoRef.current = false;
                limpaVertices();
                caminhoTemporarioRef.current = [];
                if (poligonoTemporarioRef.current) {
                    poligonoTemporarioRef.current.setMap(null);
                    poligonoTemporarioRef.current = null;
                }
            },
        }));

        return (
            <div className="relative h-full min-h-[30rem] overflow-hidden rounded-2xl border">
                {(carregando || erro) && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-muted/60 px-6">
                        {erro ? (
                            <p className="text-center text-sm text-muted-foreground">{erro}</p>
                        ) : (
                            <Spinner className="h-6 w-6" />
                        )}
                    </div>
                )}
                <div ref={containerRef} className="h-full min-h-[30rem] w-full" />
            </div>
        );
    },
);

export default MapaEntregaEditor;
