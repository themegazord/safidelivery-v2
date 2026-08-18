import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TFormaPagamento } from "@/Pages/Empresa/CardapioDigital/FinalizarPedido";
import { converteReal } from "@/utils/utils";

interface IProps {
  formasPagamentos: TFormaPagamento[],
  formaPagamento: string | undefined,
  setFormaPagamento: (value: string | undefined) => void,
  total: number,
  trocoPara: number | undefined,
  setTrocoPara: (value: number | undefined) => void
}

export default function SelecaoFormaPagamento({
  formasPagamentos,
  formaPagamento,
  setFormaPagamento,
  total,
  trocoPara,
  setTrocoPara
 }: IProps) {
    const pagaEmDinheiro = formasPagamentos.find((fp) => String(fp.value) === formaPagamento)?.tipo === 'DIN';
    const trocoInsuficiente = trocoPara !== undefined && trocoPara < total;

    return (
        <Card>
            <CardHeader>
              <CardTitle>Forma de pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <Select value={formaPagamento} onValueChange={(value) => setFormaPagamento(value ?? undefined)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma forma de pagamento">
                      {(value: string | null) =>
                        formasPagamentos.find((fp) => String(fp.value) === value)?.label ?? "Selecione uma forma de pagamento"
                      }
                    </SelectValue>
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
              {pagaEmDinheiro && (
                <Field data-invalid={trocoInsuficiente}>
                  <FieldLabel>Troco para quanto?</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="Deixe em branco se não precisar de troco"
                    value={trocoPara ?? ""}
                    aria-invalid={trocoInsuficiente}
                    onChange={(e) => setTrocoPara(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                  {trocoInsuficiente ? (
                    <FieldError>O valor deve ser maior ou igual ao total do pedido (R$ {converteReal(total)}).</FieldError>
                  ) : (
                    trocoPara !== undefined && (
                      <p className="text-xs text-muted-foreground">Troco: R$ {converteReal(trocoPara - total)}</p>
                    )
                  )}
                </Field>
              )}
            </CardContent>
        </Card>
    );
}
