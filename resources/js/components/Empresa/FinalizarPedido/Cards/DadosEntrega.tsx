import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { H6 } from "@/components/utils/Heading";
import { IDadosDistanciaRota } from "@/Pages/Empresa/CardapioDigital/FinalizarPedido";
import { IAuth } from "@/types/usuario-autenticado/usuario";
import { converteReal } from "@/utils/utils";
import { ArrowRightLeft, Clock, MapPin, Plus, TriangleAlert } from "lucide-react";

type TTipoFuncionamento = 'delivery' | 'retirada' | 'mesa'

interface IProps {
  auth: IAuth,
  tipo_funcionamento: TTipoFuncionamento
  numeroMesa: number | undefined,
  erroEntrega: string | null,
  dadosDistanciaRota: IDadosDistanciaRota | null,
  configuracoes: Record<string, string>,
  total: number,
  setTipoEntrega: (value: TTipoFuncionamento) => void,
  setNumeroMesa: (value: number | undefined) => void,
  setToggleAlteraEnderecoPrincipal: (value: boolean) => void,
  setToggleCadastraEnderecoNovo: (value: boolean) => void,
}

export default function DadosEntrega({
  auth,
  tipo_funcionamento,
  numeroMesa,
  setTipoEntrega,
  setNumeroMesa,
  erroEntrega,
  dadosDistanciaRota,
  configuracoes,
  total,
  setToggleAlteraEnderecoPrincipal,
  setToggleCadastraEnderecoNovo
}: IProps) {

    const TIPOS_ENTREGA = [
      {
          titulo: 'Receber em casa',
          descricao: 'Entrega no seu endereço',
          value: 'delivery',
          disabled: ['retirada', 'delivery']
      },
      {
          titulo: 'Buscar o pedido',
          descricao: 'Retire na loja',
          value: 'retirada',
          disabled: ['retirada', 'delivery']
      },
      {
          titulo: 'Consumir no local',
          descricao: 'Pedido na mesa',
          value: 'mesa',
          disabled: ['mesa']
      },
  ]
  
  return (
    <Card>
      {auth.user && auth.user.cliente && (
          <CardHeader>
              <CardTitle className="flex items-center justify-between">
                  <H6>Este pedido será entregue a:</H6>
                  <Button variant={'link'} className="cursor-pointer">
                      Trocar
                  </Button>
              </CardTitle>
              <CardDescription className="space-y-2 rounded-lg border p-4">
                  <h3 className="font-semibold">{ auth.user.cliente.nome }</h3>
                  <p className="text-sm">{ auth.user.cliente.telefone }</p>
              </CardDescription>
          </CardHeader>
      )}
      <CardContent className="space-y-3">
          <H6 className="font-semibold">Escolha como receber o pedido</H6>
          <div className="space-y-2">
              <RadioGroup defaultValue={tipo_funcionamento} className="w-full" onValueChange={(value) => setTipoEntrega(value as typeof tipo_funcionamento)}>
                  {TIPOS_ENTREGA.map((te, teIdx) => (
                      <FieldLabel htmlFor={te.value} key={teIdx}>
                          <Field orientation="horizontal" data-disabled={!te.disabled.includes(tipo_funcionamento)}>
                              <FieldContent>
                                  <FieldTitle>{te.titulo}</FieldTitle>
                                  <FieldDescription>{te.descricao}</FieldDescription>
                              </FieldContent>
                              <RadioGroupItem value={te.value} id={te.value} disabled={!te.disabled.includes(tipo_funcionamento)}/>
                          </Field>
                      </FieldLabel>
                  ))}
              </RadioGroup>

              {tipo_funcionamento === 'mesa' && (
                  <Field>
                      <FieldLabel htmlFor="numeroMesa">Número da mesa:</FieldLabel>
                      <Input type="number" value={numeroMesa ?? ''} onChange={(e) => setNumeroMesa(e.target.value ? Number(e.target.value) : undefined)}/>
                  </Field>
              )}

              {tipo_funcionamento === 'delivery' && (
                  <>
                      {auth.user && auth.user.cliente && auth.user.cliente.endereco ? (
                          <Card>
                              <CardHeader>
                                  <CardTitle className="w-full flex justify-between items-center">
                                      <div className="flex gap-2">
                                      <MapPin className="size-5" />
                                          <div className="flex flex-col">
                                              <span className="flex gap-2">
                                                  <p className="font-medium">
                                                      {auth.user?.cliente.endereco?.logradouro}, {auth.user?.cliente.endereco?.numero}
                                                  </p>
                                              </span>
                                              <span className="text-sm text-foreground/60">
                                                  {auth.user?.cliente.endereco?.cidade}/{auth.user?.cliente.endereco?.uf}
                                              </span> 
                                          </div>
                                      </div>
                                      <div className="flex flex-col gap-4 sm:flex-row">
                                          {(auth.user?.cliente.enderecos.length ?? 0)> 1 && (
                                              <Button className="cursor-pointer" size={"sm"} variant={"ghost"} onClick={() => setToggleAlteraEnderecoPrincipal(true)}>Trocar {" "} <ArrowRightLeft /></Button>
                                          )}
                                          <Button className="cursor-pointer" size={"sm"} variant={"ghost"} onClick={() => setToggleCadastraEnderecoNovo(true)} >Novo {" "} <Plus /></Button>
                                      </div>
                                  </CardTitle>
                              </CardHeader>
                              <CardContent>
                                  {!erroEntrega ? (
                                      <div className="flex items-center gap-2 pt-2">
                                          <Clock className="size-5" />
                                          <div>
                                              <p className="font-medium">Padrão</p>
                                              <p className="text-sm">Hoje, {dadosDistanciaRota?.dadosDistanciaRota.duracao}</p>
                                              {(dadosDistanciaRota?.dadosDistanciaRota.taxaFrete ?? null) === 0 && Number(configuracoes.frete_gratis_acima ?? 0) > 0 ? (
                                                  <p className="text-sm font-medium text-green-400">Frete grátis aplicado!</p>
                                              ) : (
                                                  <>
                                                      <p className="text-sm font-medium">Taxa de entrega: R$ {converteReal(dadosDistanciaRota?.dadosDistanciaRota.taxaFrete ?? 0)}</p>
                                                      {Number(configuracoes.frete_gratis_acima ?? 0) > 0 && total < Number(configuracoes.frete_gratis_acima ?? 0) && (
                                                          <p className="text-xs">Faltam: R$ {converteReal(Number(configuracoes.frete_gratis_acima ?? 0) - total)} para frete grátis</p>
                                                      )}
                                                  </>
                                              )}
                                          </div>
                                      </div>
                                  ) : (
                                      <Alert className="border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-50">
                                          <TriangleAlert />
                                          <AlertDescription>
                                              {erroEntrega}
                                          </AlertDescription>
                                      </Alert>
                                  )}
                              </CardContent>
                          </Card>
                      ) : (
                          <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                              <TriangleAlert />
                              <AlertDescription>Você precisa cadastrar um endereço para continuar.</AlertDescription>
                              <AlertAction>
                                  <Button>
                                      <Plus />{" "}Cadastrar um endereço
                                  </Button>
                              </AlertAction>
                          </Alert>
                      )}
                  </>
              )}
          </div>
      </CardContent>
  </Card>
  )
}