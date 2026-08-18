import { useEffect, useState } from "react";
import { Check, Copy, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { IPixPagamento } from "@/types/cliente/pedidos";

interface IProps {
    pix: IPixPagamento;
}

const DURACAO_TOTAL_SEGUNDOS = 5 * 60;

function calculaSegundosRestantes(expiraEm: string): number {
    return Math.max(0, Math.floor((new Date(expiraEm).getTime() - Date.now()) / 1000));
}

function formataTempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const resto = segundos % 60;
    return `${minutos}:${resto.toString().padStart(2, "0")}`;
}

export default function PixPagamentoCard({ pix }: IProps) {
    const [segundosRestantes, setSegundosRestantes] = useState(() => calculaSegundosRestantes(pix.expira_em));
    const [copiado, setCopiado] = useState(false);

    useEffect(() => {
        const intervalo = setInterval(() => {
            setSegundosRestantes(calculaSegundosRestantes(pix.expira_em));
        }, 1000);

        return () => clearInterval(intervalo);
    }, [pix.expira_em]);

    async function copiarCodigo() {
        try {
            await navigator.clipboard.writeText(pix.copia_cola);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        } catch {
            // navegador sem permissão/suporte a clipboard — sem feedback além do padrão
        }
    }

    const expirado = segundosRestantes <= 0;

    return (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-sky-300 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/30">
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-sky-700 uppercase dark:text-sky-300">
                <QrCode className="size-3.5" />
                Pagamento via Pix
            </p>

            {expirado ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                    O prazo para pagamento deste Pix expirou.
                </p>
            ) : (
                <>
                    {pix.url_qrcode && (
                        <img
                            src={pix.url_qrcode}
                            alt="QR Code do Pix"
                            className="size-40 rounded-lg bg-white p-1 sm:size-48"
                        />
                    )}

                    <div className="flex w-full max-w-xs items-center gap-1.5">
                        <Input readOnly value={pix.copia_cola} className="font-mono text-xs" />
                        <Button
                            type="button"
                            size="icon"
                            variant={copiado ? "default" : "outline"}
                            className="shrink-0"
                            onClick={copiarCodigo}
                            aria-label="Copiar código Pix"
                        >
                            {copiado ? <Check /> : <Copy />}
                        </Button>
                    </div>

                    <div className="flex w-full max-w-xs flex-col gap-1">
                        <Progress value={(segundosRestantes / DURACAO_TOTAL_SEGUNDOS) * 100} />
                        <p
                            className={`text-center text-xs font-bold ${segundosRestantes <= 60 ? "text-destructive" : "text-muted-foreground"}`}
                        >
                            Expira em {formataTempo(segundosRestantes)}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
