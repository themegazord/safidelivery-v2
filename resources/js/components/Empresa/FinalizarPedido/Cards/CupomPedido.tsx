import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface IProps {
  cupomPedido: string | undefined,
  setCupomPedido: (value: string) => void
}

export default function CupomPedido({
  cupomPedido,
  setCupomPedido
}: IProps) {
    return (
        <Card>
            <CardContent>
              <Field>
                <FieldLabel>Cupom de Desconto</FieldLabel>
                <Input value={cupomPedido} onBlur={(event) => setCupomPedido(event.target.value)} placeholder="EX: DESCONTO20" />
                <FieldDescription>Use um cupom de desconto no seu pedido.</FieldDescription>
              </Field>
            </CardContent>
        </Card>
    );
}
