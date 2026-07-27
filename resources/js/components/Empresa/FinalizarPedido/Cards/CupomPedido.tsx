import { useState } from "react";
import { Loader, Tag, Ticket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import ModalCuponsDisponiveis from "@/components/Empresa/FinalizarPedido/Modais/ModalCuponsDisponiveis";
import { converteReal } from "@/utils/utils";
import { ICupomAplicado, ICupomVisivel } from "@/types/finalizar-pedido/cupom";

interface IProps {
    cupomPedido: string | undefined;
    setCupomPedido: (value: string) => void;
    cupomAplicado: ICupomAplicado | null;
    cuponsVisiveis: ICupomVisivel[];
    validandoCupom: boolean;
    onAplicar: (cupom: string) => void;
    onRemover: () => void;
}

export default function CupomPedido({
    cupomPedido,
    setCupomPedido,
    cupomAplicado,
    cuponsVisiveis,
    validandoCupom,
    onAplicar,
    onRemover,
}: IProps) {
    const [modalCuponsAberto, setModalCuponsAberto] = useState(false);

    return (
        <Card>
            <CardContent>
                <Field>
                    <FieldLabel>Cupom de Desconto</FieldLabel>
                    {cupomAplicado ? (
                        <div className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/5 px-3 py-2">
                            <div className="flex items-center gap-2">
                                <Ticket className="size-4 text-primary" />
                                <span className="font-mono font-semibold text-primary">
                                    {cupomAplicado.nome_cupom}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    − R${" "}
                                    {converteReal(
                                        cupomAplicado.valor_desconto_calculado,
                                    )}
                                </span>
                            </div>
                            <InputGroupButton
                                type="button"
                                size="icon-xs"
                                onClick={onRemover}
                            >
                                <X />
                            </InputGroupButton>
                        </div>
                    ) : (
                        <InputGroup>
                            <InputGroupInput
                                value={cupomPedido ?? ""}
                                onChange={(event) =>
                                    setCupomPedido(
                                        event.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="EX: DESCONTO20"
                                disabled={validandoCupom}
                            />
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                    type="button"
                                    disabled={!cupomPedido || validandoCupom}
                                    onClick={() =>
                                        cupomPedido && onAplicar(cupomPedido)
                                    }
                                >
                                    {validandoCupom ? (
                                        <Loader className="animate-spin" />
                                    ) : (
                                        "Aplicar"
                                    )}
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                    )}
                    <FieldDescription>
                        Use um cupom de desconto no seu pedido.
                    </FieldDescription>
                </Field>

                {cuponsVisiveis.length > 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setModalCuponsAberto(true)}
                    >
                        <Tag /> Ver cupons disponíveis ({cuponsVisiveis.length}
                        )
                    </Button>
                )}
            </CardContent>

            <ModalCuponsDisponiveis
                aberto={modalCuponsAberto}
                onOpenChange={setModalCuponsAberto}
                cuponsVisiveis={cuponsVisiveis}
                cupomAplicado={cupomAplicado}
                onSelecionar={onAplicar}
            />
        </Card>
    );
}
