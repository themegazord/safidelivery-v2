import { Clipboard, SquarePen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DIAS_SEMANA, IPromocao } from "@/types/empresa/promocoes/types";

type ModalDetalhesCupomProps = {
    aberto: boolean;
    onOpenChange: (aberto: boolean) => void;
    cupom: IPromocao | null;
    onEditar: () => void;
    podeEditar: boolean;
};

function Campo({ label, valor }: { label: string; valor: string }) {
    return (
        <div className="flex flex-col">
            <p className="text-xs font-bold text-muted-foreground">
                {label}
            </p>
            <p className="text-sm">{valor}</p>
        </div>
    );
}

export default function ModalDetalhesCupom({
    aberto,
    onOpenChange,
    cupom,
    onEditar,
    podeEditar,
}: ModalDetalhesCupomProps) {
    if (!cupom) {
        return null;
    }

    const diasDisponiveis: number[] = JSON.parse(cupom.dias_disponiveis);
    const descricaoDias =
        diasDisponiveis.length === 7
            ? "Todos os dias"
            : diasDisponiveis
                  .map(
                      (dia) =>
                          DIAS_SEMANA.find((d) => d.id === dia)?.nome ?? "",
                  )
                  .join("; ");

    async function copiarCodigo() {
        await navigator.clipboard.writeText(cupom!.nome_cupom);
        toast.success("Código copiado com sucesso!");
    }

    return (
        <Dialog open={aberto} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Resumo do cupom</DialogTitle>
                    <DialogDescription>
                        Informações do cadastro do seu cupom
                    </DialogDescription>
                </DialogHeader>

                <div className="relative flex flex-col gap-4 rounded-lg border border-border p-4">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        className="absolute top-4 right-4"
                        onClick={onEditar}
                        disabled={!podeEditar}
                    >
                        <SquarePen />
                    </Button>

                    <div className="mt-8 flex flex-col gap-2">
                        <p className="text-sm font-bold">Código</p>
                        <div className="flex w-full items-center justify-between gap-2 rounded border border-border px-4 py-2 sm:w-80">
                            <p className="font-mono">{cupom.nome_cupom}</p>
                            <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={copiarCodigo}
                            >
                                <Clipboard />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Copie o código e compartilhe com quem quiser
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        <Campo
                            label="Descrição"
                            valor={cupom.descricao_cupom}
                        />
                        <Campo
                            label="Válido para cliente novo?"
                            valor={cupom.valido_cliente_novo ? "Sim" : "Não"}
                        />
                        <Campo
                            label="Desconto em"
                            valor={
                                cupom.onde_afetara === "produto"
                                    ? "Produtos"
                                    : "Frete"
                            }
                        />
                        <Campo
                            label="Tipo do desconto"
                            valor={
                                cupom.tipo_cupom === "porcentagem"
                                    ? "Porcentagem"
                                    : "Reais"
                            }
                        />
                        <Campo
                            label="Valor do desconto"
                            valor={
                                cupom.tipo_cupom === "porcentagem"
                                    ? `${cupom.valor_desconto}%`
                                    : `R$ ${cupom.valor_desconto.toLocaleString(
                                          "pt-BR",
                                          { minimumFractionDigits: 2 },
                                      )}`
                            }
                        />
                        <Campo
                            label="Valor mínimo do pedido"
                            valor={`R$ ${cupom.valor_minimo_pedido.toLocaleString(
                                "pt-BR",
                                { minimumFractionDigits: 2 },
                            )}`}
                        />
                        <Campo
                            label="Valor máximo do desconto"
                            valor={`R$ ${cupom.valor_maximo_desconto.toLocaleString(
                                "pt-BR",
                                { minimumFractionDigits: 2 },
                            )}`}
                        />
                        <Campo
                            label="Uso do cupom"
                            valor={
                                cupom.qtde_clientes_usabilidade === "limitado"
                                    ? "Limitado"
                                    : "Ilimitado"
                            }
                        />
                        <Campo
                            label="Período de validade"
                            valor={`${new Date(
                                cupom.created_at,
                            ).toLocaleDateString("pt-BR")} - ${new Date(
                                `${cupom.data_vencimento}T00:00:00`,
                            ).toLocaleDateString("pt-BR")}`}
                        />
                        <Campo
                            label="Cupom visível para cliente?"
                            valor={cupom.cupom_visivel ? "Sim" : "Não"}
                        />
                        <Campo
                            label="Dias disponíveis"
                            valor={descricaoDias}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
