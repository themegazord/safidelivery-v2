import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TFormaPagamento, TPagamentoMultiplo } from "@/Pages/Empresa/CardapioDigital/FinalizarPedido";
import { converteReal } from "@/utils/utils";
import { Plus, Trash2 } from "lucide-react";

interface IProps {
  formasPagamentos: TFormaPagamento[],
  formaPagamento: string | undefined,
  setFormaPagamento: (value: string | undefined) => void,
  total: number,
  trocoPara: number | undefined,
  setTrocoPara: (value: number | undefined) => void,
  multiplasFormasHabilitado: boolean,
  usarMultiplasFormas: boolean,
  setUsarMultiplasFormas: (value: boolean) => void,
  pagamentosMultiplos: TPagamentoMultiplo[],
  setPagamentosMultiplos: (value: TPagamentoMultiplo[]) => void,
}

function novoPagamento(): TPagamentoMultiplo {
  return { forma_pagamento_id: undefined, valor: "", troco_para: "" };
}

export default function SelecaoFormaPagamento({
  formasPagamentos,
  formaPagamento,
  setFormaPagamento,
  total,
  trocoPara,
  setTrocoPara,
  multiplasFormasHabilitado,
  usarMultiplasFormas,
  setUsarMultiplasFormas,
  pagamentosMultiplos,
  setPagamentosMultiplos,
 }: IProps) {
    const pagaEmDinheiro = formasPagamentos.find((fp) => String(fp.value) === formaPagamento)?.tipo === 'DIN';
    const trocoInsuficiente = trocoPara !== undefined && trocoPara < total;

    const somaPagamentos = pagamentosMultiplos.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
    const restanteAlocar = Math.round((total - somaPagamentos) * 100) / 100;

    function atualizarPagamento(index: number, dados: Partial<TPagamentoMultiplo>) {
      setPagamentosMultiplos(
        pagamentosMultiplos.map((p, i) => (i === index ? { ...p, ...dados } : p))
      );
    }

    function adicionarPagamento() {
      setPagamentosMultiplos([...pagamentosMultiplos, novoPagamento()]);
    }

    function removerPagamento(index: number) {
      setPagamentosMultiplos(pagamentosMultiplos.filter((_, i) => i !== index));
    }

    function toggleMultiplasFormas(ativo: boolean) {
      setUsarMultiplasFormas(ativo);
      setPagamentosMultiplos(ativo ? [novoPagamento()] : []);
    }

    return (
        <Card>
            <CardHeader className="flex items-center justify-between gap-4">
              <CardTitle>Forma de pagamento</CardTitle>
              {multiplasFormasHabilitado && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Dividir pagamento</span>
                  <Switch checked={usarMultiplasFormas} onCheckedChange={toggleMultiplasFormas} />
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {!usarMultiplasFormas ? (
                <>
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
                </>
              ) : (
                <div className="space-y-4">
                  {pagamentosMultiplos.map((pagamento, index) => {
                    const tipoLinha = formasPagamentos.find((fp) => String(fp.value) === pagamento.forma_pagamento_id)?.tipo;
                    const linhaEmDinheiro = tipoLinha === 'DIN';
                    const valorLinha = Number(pagamento.valor) || 0;
                    const trocoLinha = pagamento.troco_para ? Number(pagamento.troco_para) : undefined;
                    const trocoLinhaInsuficiente = trocoLinha !== undefined && trocoLinha < valorLinha;

                    return (
                      <div key={index} className="space-y-3 rounded-lg border p-3">
                        <div className="flex items-start gap-2">
                          <Field className="flex-1">
                            <FieldLabel>Forma de pagamento {index + 1}</FieldLabel>
                            <Select
                              value={pagamento.forma_pagamento_id}
                              onValueChange={(value) => atualizarPagamento(index, { forma_pagamento_id: value ?? undefined })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione">
                                  {(value: string | null) =>
                                    formasPagamentos.find((fp) => String(fp.value) === value)?.label ?? "Selecione"
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
                          <Field className="w-32">
                            <FieldLabel>Valor</FieldLabel>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              placeholder="0,00"
                              value={pagamento.valor}
                              onChange={(e) => atualizarPagamento(index, { valor: e.target.value })}
                            />
                          </Field>
                          {pagamentosMultiplos.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="mt-6"
                              onClick={() => removerPagamento(index)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                        {linhaEmDinheiro && (
                          <Field data-invalid={trocoLinhaInsuficiente}>
                            <FieldLabel>Troco para quanto?</FieldLabel>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              placeholder="Deixe em branco se não precisar de troco"
                              value={pagamento.troco_para}
                              aria-invalid={trocoLinhaInsuficiente}
                              onChange={(e) => atualizarPagamento(index, { troco_para: e.target.value })}
                            />
                            {trocoLinhaInsuficiente && (
                              <FieldError>O valor deve ser maior ou igual ao valor desta forma de pagamento (R$ {converteReal(valorLinha)}).</FieldError>
                            )}
                          </Field>
                        )}
                      </div>
                    );
                  })}

                  <Button type="button" variant="outline" size="sm" onClick={adicionarPagamento} className="gap-1.5">
                    <Plus className="size-4" />
                    Adicionar forma de pagamento
                  </Button>

                  <p className={`text-sm ${Math.abs(restanteAlocar) > 0.005 ? "text-destructive" : "text-muted-foreground"}`}>
                    {Math.abs(restanteAlocar) <= 0.005
                      ? "Valores conferem com o total do pedido."
                      : restanteAlocar > 0
                        ? `Ainda falta alocar R$ ${converteReal(restanteAlocar)}.`
                        : `A soma excede o total do pedido em R$ ${converteReal(Math.abs(restanteAlocar))}.`}
                  </p>
                </div>
              )}
            </CardContent>
        </Card>
    );
}
