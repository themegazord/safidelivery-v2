import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TFormaPagamento } from "@/Pages/Empresa/CardapioDigital/FinalizarPedido";

interface IProps {
  formasPagamentos: TFormaPagamento[],
  formaPagamento: string | undefined,
  setFormaPagamento: (value: string | undefined) => void
}

export default function SelecaoFormaPagamento({ 
  formasPagamentos,
  formaPagamento,
  setFormaPagamento
 }: IProps) {
    return (
        <Card>
            <CardHeader>
              <CardTitle>Forma de pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Field>
                <Select value={formaPagamento} onValueChange={(value) => setFormaPagamento(value ?? undefined)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Formas de pagamentos</SelectLabel>
                      {formasPagamentos.map((fp, idx) => (
                        <SelectItem key={idx} value={String(fp.value)}>
                          {fp.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </CardContent>
        </Card>
    );
}
