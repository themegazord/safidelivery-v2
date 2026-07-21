import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

interface IProps {
    observacaoPedido: string | undefined,
    setObservacaoPedido: (value: string | undefined) => void
}

export default function ObsersavaoPedido({observacaoPedido, setObservacaoPedido}: IProps) {
    return (
        <Card>
            <CardContent>
                <Field>
                    <FieldLabel>Observação do Pedido</FieldLabel>
                    <Textarea value={observacaoPedido} onBlur={(event) => setObservacaoPedido(event.target.value)} placeholder="Alguma observação para o pedido?" />
                </Field>
            </CardContent>
        </Card>
    );
}
